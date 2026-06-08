export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL; const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const authHeader = req.headers.authorization || ''; const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!supabaseUrl || !supabaseAnonKey) return res.status(500).json({ ok:false, message:'Missing Supabase env vars' });
  if (!token) return res.status(401).json({ ok:false });
  const r = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` } });
  return res.status(r.ok ? 200 : 401).json({ ok: r.ok });
}
