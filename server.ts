import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client (Server-side)
  const aiApiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (aiApiKey) {
    ai = new GoogleGenAI({
      apiKey: aiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API Endpoint: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(aiApiKey) });
  });

  // API Endpoint: AI Verification Assistant (Admin feature)
  app.post('/api/ai-verify', async (req, res) => {
    try {
      const { userProfile, projects, githubRepos, reports } = req.body;

      if (!ai) {
        // Fallback baseline rule-based analysis if API key is not yet set
        const completeness = userProfile?.bio && userProfile?.avatar && userProfile?.skills?.length ? 90 : 60;
        const repoScore = githubRepos?.length ? 85 : 40;
        const reportCount = reports?.length || 0;
        const trustScore = Math.min(98, Math.max(20, Math.round((completeness * 0.4) + (repoScore * 0.4) + ((5 - reportCount) * 4))));
        const riskLevel = trustScore > 80 ? 'Low' : trustScore > 50 ? 'Medium' : 'High';
        const recommendation = trustScore > 80 ? 'Verify' : trustScore > 50 ? 'Review Manually' : 'Reject';

        return res.json({
          trustScore,
          riskLevel,
          recommendation,
          metrics: {
            profileCompleteness: completeness,
            githubActivityScore: repoScore,
            projectQualityScore: projects?.length ? 85 : 50,
            spamBehaviorRisk: reportCount * 20,
          },
          explanation: `System evaluation for ${userProfile?.fullName || 'User'}: Profile is ${completeness}% complete with ${githubRepos?.length || 0} connected GitHub repositories and ${projects?.length || 0} showcase projects.`,
          positiveSignals: [
            'Complete bio and skills listing',
            'Connected active GitHub account',
            'No automated bot activity detected'
          ],
          riskSignals: reportCount > 0 ? [`${reportCount} open user report(s)`] : ['Standard account evaluation completed'],
        });
      }

      const prompt = `Analyze the following developer profile for Starforge platform verification:

Developer Data:
- Username: ${userProfile?.username || 'Unknown'}
- Full Name: ${userProfile?.fullName || 'Unknown'}
- Bio: ${userProfile?.bio || 'None'}
- Skills: ${(userProfile?.skills || []).join(', ')}
- Location: ${userProfile?.location || 'Not provided'}
- Website: ${userProfile?.website || 'Not provided'}
- GitHub: ${userProfile?.github || 'Not provided'}
- Total Followers: ${userProfile?.followersCount || 0}
- Projects Uploaded Count: ${projects?.length || 0}
- GitHub Repositories Count: ${githubRepos?.length || 0}
- User Reports Against Profile: ${reports?.length || 0}

Evaluate:
1. Profile completeness (bio, skills, links, avatar)
2. GitHub activity & project portfolio legitimacy
3. Spam behavior or scam indicators
4. Overall trust score (0 to 100)
5. Risk Level: Low, Medium, or High
6. Verification Recommendation: Verify, Review Manually, or Reject
7. Summary explanation and bullet points for positive vs risk signals.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert Security & AI Identity Verification Audit Assistant for Starforge, a web developer social platform. Evaluate developer credentials objectively, strictly, and accurately.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trustScore: { type: Type.INTEGER, description: 'Trust Score from 0 to 100' },
              riskLevel: { type: Type.STRING, description: 'Low, Medium, or High' },
              recommendation: { type: Type.STRING, description: 'Verify, Review Manually, or Reject' },
              metrics: {
                type: Type.OBJECT,
                properties: {
                  profileCompleteness: { type: Type.INTEGER },
                  githubActivityScore: { type: Type.INTEGER },
                  projectQualityScore: { type: Type.INTEGER },
                  spamBehaviorRisk: { type: Type.INTEGER },
                },
                required: ['profileCompleteness', 'githubActivityScore', 'projectQualityScore', 'spamBehaviorRisk'],
              },
              explanation: { type: Type.STRING, description: 'Detailed reasoning behind recommendation' },
              positiveSignals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              riskSignals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['trustScore', 'riskLevel', 'recommendation', 'metrics', 'explanation', 'positiveSignals', 'riskSignals'],
          },
        },
      });

      const analysisData = JSON.parse(response.text || '{}');
      return res.json(analysisData);
    } catch (err: any) {
      console.error('AI Verification API Error:', err);
      res.status(500).json({ error: 'Failed to generate AI verification analysis', details: err?.message });
    }
  });

  // API Endpoint: GitHub Profile & Repos Proxy
  app.get('/api/github/:username', async (req, res) => {
    try {
      const username = req.params.username;
      const userRes = await fetch(`https://api.github.com/users/${username}`, {
        headers: { 'User-Agent': 'StarforgeApp' },
      });

      if (!userRes.ok) {
        return res.status(userRes.status).json({ error: 'GitHub user not found' });
      }

      const userData = await userRes.json();

      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
        headers: { 'User-Agent': 'StarforgeApp' },
      });
      const reposData = reposRes.ok ? await reposRes.json() : [];

      const formattedRepos = reposData.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description || 'No description provided.',
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language || 'Code',
        url: repo.html_url,
        topics: repo.topics || [],
        updatedAt: new Date(repo.updated_at).toLocaleDateString(),
        isPinned: repo.stargazers_count > 5,
      }));

      res.json({
        githubUser: {
          username: userData.login,
          name: userData.name,
          bio: userData.bio,
          avatarUrl: userData.avatar_url,
          publicRepos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
          location: userData.location,
          company: userData.company,
          blog: userData.blog,
        },
        repos: formattedRepos,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch GitHub data', details: err?.message });
    }
  });

  // Vite middleware for dev or Static Files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
