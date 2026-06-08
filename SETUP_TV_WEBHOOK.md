# Trading Master V4.0 — TradingView Webhook Engine

Standalone project.

## Flow
TradingView Pine Script → TradingView Alert Webhook → `/api/tv-webhook` → Supabase `tv_trade_events` → Dashboard

## Vercel Environment Variables

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
TRADINGVIEW_WEBHOOK_SECRET
```

## Supabase SQL

```sql
create table if not exists public.tv_trade_events (
  event_key text primary key,
  trade_id text not null,
  event_type text not null,
  symbol text not null default 'XAUUSD',
  tf text,
  sig text,
  entry numeric,
  sl numeric,
  tp1 numeric,
  tp2 numeric,
  tp3 numeric,
  pips integer not null default 0,
  quality integer,
  strategy text,
  market_regime text,
  wave_personality text,
  reason text,
  day text not null,
  month text not null,
  source text not null default 'TradingView',
  created_at timestamptz not null default now()
);

create index if not exists tv_trade_events_trade_id_idx on public.tv_trade_events(trade_id);
create index if not exists tv_trade_events_day_idx on public.tv_trade_events(day);
create index if not exists tv_trade_events_month_idx on public.tv_trade_events(month);
create index if not exists tv_trade_events_symbol_idx on public.tv_trade_events(symbol);

alter table public.tv_trade_events enable row level security;
```

## TradingView Alert setup

1. Open TradingView chart, preferably `OANDA:XAUUSD` or your chosen XAUUSD chart.
2. Open Pine Editor.
3. Paste `pine/trading_master_v4_signal_engine.pine`.
4. Add it to chart.
5. Create Alert.
6. Select this script and choose `Any alert() function call`.
7. Webhook URL: `https://YOUR-VERCEL-PROJECT.vercel.app/api/tv-webhook`
8. Message can be anything because Pine sends JSON from `alert()` automatically.
