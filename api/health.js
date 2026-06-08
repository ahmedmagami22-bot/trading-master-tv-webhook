export default async function handler(req, res){
  return res.status(200).json({ ok:true, project:'Trading Master V4 TradingView Webhook Engine', has_supabase_url:Boolean(process.env.SUPABASE_URL), has_supabase_anon:Boolean(process.env.SUPABASE_ANON_KEY), has_service_key:Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), has_webhook_secret:Boolean(process.env.TRADINGVIEW_WEBHOOK_SECRET) ,
    login_endpoint: '/api/login-server'
  });
}
