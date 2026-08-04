import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { INITIAL_GITHUB_REPOS } from '../../data/initialData';
import {
  X,
  Image as ImageIcon,
  Video,
  Code2,
  Github,
  Send,
  Sparkles,
  CheckCircle2,
  Music,
  Users,
  Plus,
  Play,
  Upload,
  Link as LinkIcon,
  Check,
} from 'lucide-react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Gallery presets
const SAMPLE_IMAGE_GALLERY = [
  {
    id: 'img1',
    title: 'Dashboard UI',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
  },
  {
    id: 'img2',
    title: 'Code Editor',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
  },
  {
    id: 'img3',
    title: 'Mobile App',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop',
  },
  {
    id: 'img4',
    title: 'AI Canvas',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
  },
  {
    id: 'img5',
    title: 'Fullstack Arch',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop',
  },
];

const SAMPLE_REEL_GALLERY = [
  {
    id: 'reel1',
    title: 'React 19 Hooks Demo',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-code-editor-screen-with-lines-of-code-42861-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop',
  },
  {
    id: 'reel2',
    title: 'Fast API Deployment',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-42862-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&auto=format&fit=crop',
  },
  {
    id: 'reel3',
    title: 'WebGL Shader Effect',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-digital-lines-background-42859-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop',
  },
];

const MUSIC_TRACKS = [
  'Chill Lofi Code Beats',
  'Cyberpunk Synthwave Vibe',
  'Acoustic Focus Flow',
  'Deep Tech Ambient',
  'Custom Music Upload (Coming Soon)',
];

export const CreateModal: React.FC<CreateModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, users } = useAuth();
  const { createPost, createReel } = useSocial();

  const [createType, setCreateType] = useState<'post' | 'reel' | 'project' | 'github'>('post');

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGE_GALLERY[0].url);
  const [videoUrl, setVideoUrl] = useState(SAMPLE_REEL_GALLERY[0].url);
  const [demoUrl, setDemoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [tags, setTags] = useState('React, TypeScript, Tailwind');
  const [selectedMusic, setSelectedMusic] = useState('Chill Lofi Code Beats');

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setImageUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setVideoUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Collaborators Tagged
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);

  // GitHub Sync State
  const [selectedRepo, setSelectedRepo] = useState<any>(null);

  if (!isOpen || !currentUser) return null;

  const availableDevelopers = users.filter((u) => u.role === 'developer' && u.id !== currentUser.id);

  const toggleCollaborator = (username: string) => {
    setSelectedCollaborators((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let finalCaption = content;
    if (selectedCollaborators.length > 0) {
      finalCaption += `\n\n🤝 Collaborators: ${selectedCollaborators.map((c) => `@${c}`).join(', ')}`;
    }

    if (createType === 'reel') {
      createReel({
        authorId: currentUser.id,
        authorUsername: currentUser.username,
        authorFullName: currentUser.fullName,
        authorAvatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
        title: title || 'Developer Reel',
        description: finalCaption,
        videoUrl:
          videoUrl ||
          'https://assets.mixkit.co/videos/preview/mixkit-code-editor-screen-with-lines-of-code-42861-large.mp4',
        audioTitle: `${selectedMusic} • @${currentUser.username}`,
        tags: tagArray,
      });
    } else {
      createPost({
        authorId: currentUser.id,
        authorUsername: currentUser.username,
        authorFullName: currentUser.fullName,
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role,
        isVerified: currentUser.isVerified,
        type: createType === 'github' ? 'github' : createType === 'project' ? 'project' : 'post',
        title: title || (selectedRepo ? selectedRepo.name : 'Developer Showcase'),
        content: finalCaption,
        mediaUrls: imageUrl ? [imageUrl] : undefined,
        videoUrl: videoUrl || undefined,
        demoUrl: demoUrl || undefined,
        githubUrl: githubUrl || (selectedRepo ? selectedRepo.url : undefined),
        tags: tagArray,
        githubStats: selectedRepo
          ? {
              stars: selectedRepo.stars,
              forks: selectedRepo.forks,
              language: selectedRepo.language,
            }
          : undefined,
      });
    }

    // Reset & Close
    setTitle('');
    setContent('');
    setSelectedCollaborators([]);
    setSelectedRepo(null);
    onClose();
  };

  const userRepos = INITIAL_GITHUB_REPOS[currentUser.username] || INITIAL_GITHUB_REPOS['alex_dev'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Create & Publish</h3>
            <p className="text-xs text-zinc-400">Share your posts, reels, or GitHub projects</p>
          </div>
        </div>

        {/* Category Tabs: Post, Reel, Project, GitHub */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-zinc-800/80 mb-6 border border-zinc-700/60">
          <button
            type="button"
            onClick={() => setCreateType('post')}
            className={`py-2 text-xs font-bold rounded-lg transition flex flex-col items-center gap-1 ${
              createType === 'post' ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Post</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateType('reel')}
            className={`py-2 text-xs font-bold rounded-lg transition flex flex-col items-center gap-1 ${
              createType === 'reel' ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Reel</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateType('project')}
            className={`py-2 text-xs font-bold rounded-lg transition flex flex-col items-center gap-1 ${
              createType === 'project' ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Project</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateType('github')}
            className={`py-2 text-xs font-bold rounded-lg transition flex flex-col items-center gap-1 ${
              createType === 'github' ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageFileChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={videoInputRef}
          onChange={handleVideoFileChange}
          accept="video/*"
          className="hidden"
        />

        {/* 1. POST GALLERY SELECTION */}
        {createType === 'post' && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-300">
                Choose or Upload Image:
              </label>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 rounded-xl text-xs font-bold transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select from Gallery</span>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-2">
              {SAMPLE_IMAGE_GALLERY.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setImageUrl(img.url)}
                  className={`relative rounded-xl overflow-hidden aspect-square cursor-pointer border-2 transition ${
                    imageUrl === img.url
                      ? 'border-orange-500 scale-105 shadow-md shadow-orange-500/30'
                      : 'border-zinc-800 opacity-70 hover:opacity-100 hover:border-zinc-600'
                  }`}
                >
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                  {imageUrl === img.url && (
                    <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Custom URL Option or Preview */}
            <input
              type="url"
              placeholder="Or paste custom image URL..."
              value={imageUrl.startsWith('data:') ? 'Custom uploaded image attached ✓' : imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        )}

        {/* 2. REEL GALLERY SELECTION */}
        {createType === 'reel' && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-300">
                Choose or Upload Reel Video:
              </label>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 rounded-xl text-xs font-bold transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select Video File</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_REEL_GALLERY.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => setVideoUrl(reel.url)}
                  className={`relative rounded-xl overflow-hidden aspect-[9/12] cursor-pointer border-2 transition group ${
                    videoUrl === reel.url
                      ? 'border-orange-500 ring-2 ring-orange-500/40'
                      : 'border-zinc-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white opacity-80 group-hover:scale-110 transition" />
                  </div>
                  <div className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded truncate">
                    {reel.title}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Video URL */}
            <input
              type="url"
              placeholder="Or paste custom video URL (.mp4)..."
              value={videoUrl.startsWith('data:') ? 'Custom uploaded video file attached ✓' : videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        )}

        {/* 3. GITHUB REPOSITORY INTEGRATION */}
        {(createType === 'github' || createType === 'project') && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5 text-orange-400">
                <Github className="w-4 h-4" />
                <span>Connected GitHub: @{currentUser.username}</span>
              </span>
              <span className="text-[10px] text-zinc-500">Connected in profile</span>
            </div>

            <label className="block text-xs font-semibold text-zinc-300">
              Select Repository from GitHub:
            </label>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {userRepos.map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => {
                    setSelectedRepo(repo);
                    setTitle(repo.name);
                    setContent(repo.description);
                    setGithubUrl(repo.url);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    selectedRepo?.id === repo.id
                      ? 'border-orange-500 bg-orange-500/10 text-white'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-orange-400" />
                      <span>{repo.name}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate max-w-xs">{repo.description}</p>
                  </div>
                  {selectedRepo?.id === repo.id && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMMON FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Title / Project Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Realtime Analytics Dashboard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Description / Caption
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe your creation, architecture, or updates..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* TAG & COLLABORATE WITH DEVELOPERS */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                <span>Tag & Collaborate with Web Developers:</span>
              </span>
              <span className="text-[10px] text-zinc-500">Tap developer to tag</span>
            </label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-zinc-950 border border-zinc-800 rounded-xl">
              {availableDevelopers.map((dev) => {
                const isSelected = selectedCollaborators.includes(dev.username);
                return (
                  <button
                    key={dev.id}
                    type="button"
                    onClick={() => toggleCollaborator(dev.username)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <img src={dev.avatar} alt={dev.username} className="w-4 h-4 rounded-full object-cover" />
                    <span>@{dev.username}</span>
                    {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MUSIC SELECTION */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-orange-400" />
                <span>Background Music Track:</span>
              </span>
              <span className="text-[10px] text-orange-400/80">Audio Enabled</span>
            </label>
            <select
              value={selectedMusic}
              onChange={(e) => setSelectedMusic(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
            >
              {MUSIC_TRACKS.map((track) => (
                <option key={track} value={track}>
                  🎵 {track}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-500 mt-1">
              Custom music upload feature will be enabled in the upcoming audio patch.
            </p>
          </div>

          {/* PROJECT LINKS */}
          {(createType === 'project' || createType === 'github') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Live Demo Link
                </label>
                <input
                  type="url"
                  placeholder="https://myproject.com"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  GitHub Repository Link
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Tech Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="React, Flutter, AI, Node.js"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-xs text-white shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Publish to Developer Feed</span>
          </button>
        </form>
      </div>
    </div>
  );
};
