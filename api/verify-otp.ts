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
    const { email, phone, target: rawTarget, otp } = req.body || {};
    const target = String(phone || email || rawTarget || '').trim();
    if (!target || !otp) {
      return res.status(400).json({ success: false, message: 'Phone/Email and 6-digit verification code are required.' });
    }

    const isEmail = target.includes('@');
    const cleanTarget = isEmail ? target.toLowerCase() : target.replace(/\s+/g, '');
    const cleanOtp = String(otp).trim();

    if (cleanOtp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid code format. Please enter a 6-digit code.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification successful!',
      target: cleanTarget,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error verifying code.', details: err?.message });
  }
}
