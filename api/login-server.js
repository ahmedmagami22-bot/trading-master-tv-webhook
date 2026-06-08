export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok:false, message:'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ ok:false, message:'Missing SUPABASE_URL or SUPABASE_ANON_KEY on server' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ ok:false, message:'Email and password are required' });
  }

  try {
    const r = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      return res.status(401).json({
        ok:false,
        message: data.error_description || data.msg || data.error || 'Invalid login'
      });
    }

    return res.status(200).json({
      ok:true,
      access_token: data.access_token,
      refresh_token: data.refresh_token || null,
      expires_in: data.expires_in || null,
      user: data.user || null
    });
  } catch (err) {
    return res.status(500).json({ ok:false, message: err.message || 'Login request failed' });
  }
}
