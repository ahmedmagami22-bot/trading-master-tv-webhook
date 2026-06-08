function todayParts(){ const day = new Date().toISOString().slice(0,10); return { day, month: day.slice(0,7) }; }
function cleanText(v, max=500){ return String(v ?? '').slice(0, max); }
function num(v){ const n = Number(v); return Number.isFinite(n) ? n : null; }
export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ ok:false, message:'Method not allowed' });
  const secret = process.env.TRADINGVIEW_WEBHOOK_SECRET;
  if(!secret) return res.status(500).json({ ok:false, message:'Missing TRADINGVIEW_WEBHOOK_SECRET' });
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!supabaseUrl || !serviceKey) return res.status(500).json({ ok:false, message:'Missing Supabase env vars' });
  let body = req.body || {};
  if(typeof body === 'string'){ try{ body = JSON.parse(body || '{}'); }catch(e){ return res.status(400).json({ ok:false, message:'Invalid JSON' }); } }
  const suppliedSecret = body.secret || req.headers['x-tradingview-secret'];
  if(suppliedSecret !== secret) return res.status(401).json({ ok:false, message:'Invalid webhook secret' });
  const { day, month } = todayParts();
  const tradeId = cleanText(body.trade_id || `${body.symbol || 'XAUUSD'}-${body.tf || 'unknown'}-${body.time || Date.now()}`, 240);
  const eventType = cleanText(body.event_type || 'NEW_SIGNAL', 30);
  const eventKey = cleanText(body.event_key || `${tradeId}-${eventType}-${body.time || Date.now()}`, 240);
  const event = {
    event_key: eventKey, trade_id: tradeId, event_type: eventType, symbol: cleanText(body.symbol || 'XAUUSD', 20), tf: cleanText(body.tf || '', 20), sig: cleanText(body.sig || body.signal || '', 10), entry: num(body.entry), sl: num(body.sl), tp1: num(body.tp1), tp2: num(body.tp2), tp3: num(body.tp3), pips: Math.round(Number(body.pips || 0)), quality: body.quality === undefined ? null : Math.round(Number(body.quality)), strategy: cleanText(body.strategy || '', 80), market_regime: cleanText(body.market_regime || '', 80), wave_personality: cleanText(body.wave_personality || '', 80), reason: cleanText(body.reason || '', 500), day: cleanText(body.day || day, 10), month: cleanText(body.month || month, 7), source: 'TradingView'
  };
  const r = await fetch(`${supabaseUrl}/rest/v1/tv_trade_events?on_conflict=event_key`, { method:'POST', headers:{ apikey: serviceKey, Authorization:`Bearer ${serviceKey}`, 'Content-Type':'application/json', Prefer:'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify(event) });
  if(!r.ok) return res.status(500).json({ ok:false, message:'Supabase save failed', details: await r.text() });
  return res.status(200).json({ ok:true, saved:true, event_key:eventKey, trade_id:tradeId, event_type: eventType });
}
