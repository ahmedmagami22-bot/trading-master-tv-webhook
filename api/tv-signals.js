function todayParts(){
  const day = new Date().toISOString().slice(0,10);
  return { day, month: day.slice(0,7) };
}
export default async function handler(req, res){
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!supabaseUrl || !serviceKey){
    return res.status(500).json({ ok:false, message:'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
  }
  const { day, month } = todayParts();
  const limit = Math.min(Math.max(parseInt(req.query.limit || '300', 10), 50), 1000);
  const query = `select=*&or=(day.eq.${day},month.eq.${month})&order=created_at.desc&limit=${limit}`;
  const r = await fetch(`${supabaseUrl}/rest/v1/tv_trade_events?${query}`, {
    headers:{ apikey:serviceKey, Authorization:`Bearer ${serviceKey}` }
  });
  if(!r.ok) return res.status(500).json({ ok:false, message:'Read failed', details: await r.text() });
  const rows = await r.json();
  const trades = {};
  for(const e of rows.slice().reverse()){
    const id = e.trade_id;
    if(!trades[id]){
      trades[id] = {trade_id:id,symbol:e.symbol,tf:e.tf,sig:e.sig,entry:e.entry,sl:e.sl,tp1:e.tp1,tp2:e.tp2,tp3:e.tp3,quality:e.quality,strategy:e.strategy,market_regime:e.market_regime,wave_personality:e.wave_personality,reason:e.reason,created_at:e.created_at,status:'ACTIVE',tp1_hit:false,tp2_hit:false,tp3_hit:false,sl_hit:false,be_stop:false,pips:0,events:[]};
    }
    const t = trades[id];
    t.events.push(e);
    if(e.event_type === 'NEW_SIGNAL'){
      Object.assign(t,{symbol:e.symbol,tf:e.tf,sig:e.sig,entry:e.entry,sl:e.sl,tp1:e.tp1,tp2:e.tp2,tp3:e.tp3,quality:e.quality,strategy:e.strategy,market_regime:e.market_regime,wave_personality:e.wave_personality,reason:e.reason});
    }
    if(e.event_type === 'TP1'){ t.tp1_hit = true; t.pips += Number(e.pips||0); }
    if(e.event_type === 'TP2'){ t.tp2_hit = true; t.be_stop = true; t.pips += Number(e.pips||0); }
    if(e.event_type === 'TP3'){ t.tp3_hit = true; t.status='WIN'; t.pips += Number(e.pips||0); }
    if(e.event_type === 'SL'){ t.sl_hit = true; t.status='LOSS'; t.pips += Number(e.pips||0); }
    if(e.event_type === 'BE_STOP'){ t.be_stop = true; t.status='BREAKEVEN'; t.pips += Number(e.pips||0); }
  }
  const list = Object.values(trades).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
  const closed = list.filter(t => ['WIN','LOSS','BREAKEVEN'].includes(t.status));
  const wins = closed.filter(t => t.status === 'WIN').length;
  const losses = closed.filter(t => t.status === 'LOSS').length;
  const breakeven = closed.filter(t => t.status === 'BREAKEVEN').length;
  const totalClosed = wins + losses;
  const winRate = totalClosed ? Math.round((wins/totalClosed)*100) : 0;
  const totalPips = list.reduce((s,t)=>s+Number(t.pips||0),0);
  return res.status(200).json({ok:true,source:'TradingView Webhook',auth:'disabled-temporarily',day,month,stats:{wins,losses,breakeven,winRate,totalPips,active:list.filter(t=>t.status==='ACTIVE').length},trades:list});
}
