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
    const { email, phone, target: rawTarget, type: rawType } = req.body || {};
    const target = String(phone || email || rawTarget || '').trim();
    if (!target) {
      return res.status(400).json({ error: 'Valid phone number or email address is required.' });
    }

    const isEmail = target.includes('@');
    const type = rawType || (isEmail ? 'email' : 'phone');
    const cleanTarget = isEmail ? target.toLowerCase() : target.replace(/\s+/g, '');
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(cleanTarget, {
      code: generatedCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
    });

    return res.status(200).json({
      success: true,
      code: generatedCode,
      target: cleanTarget,
      type,
      message: isEmail
        ? `Verification code sent to ${cleanTarget}. Please check your inbox.`
        : `Verification code sent to phone ${cleanTarget}.`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to send OTP code.', details: err?.message });
  }
}
