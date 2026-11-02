alter table public.bot_trades add column if not exists commission_quote numeric not null default 0 check (commission_quote >= 0);
