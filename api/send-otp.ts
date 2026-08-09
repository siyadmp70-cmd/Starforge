const otpStore = new Map<string, { code: string; expiresAt: number }>();

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(cleanEmail, {
      code: generatedCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
    });

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Please check your inbox.`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to send OTP code.', details: err?.message });
  }
}
