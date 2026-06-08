export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  let authReachable = false;
  let authStatus = null;
  let authMessage = '';

  try {
    const r = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }
    });
    authReachable = true;
    authStatus = r.status;
    authMessage = r.ok ? 'Auth endpoint reachable' : await r.text();
  } catch (e) {
    authMessage = e.message;
  }

  return res.status(200).json({
    ok:true,
    has_supabase_url:Boolean(supabaseUrl),
    supabase_host:supabaseUrl.replace(/^https?:\/\//,''),
    has_anon_key:Boolean(supabaseAnonKey),
    anon_prefix:supabaseAnonKey ? supabaseAnonKey.slice(0, 14) : '',
    anon_length:supabaseAnonKey.length,
    has_service_key:Boolean(serviceKey),
    service_prefix:serviceKey ? serviceKey.slice(0, 10) : '',
    service_length:serviceKey.length,
    authReachable,
    authStatus,
    authMessage: String(authMessage).slice(0, 300)
  });
}
