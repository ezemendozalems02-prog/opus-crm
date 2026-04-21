-- Opus Prospect CRM - Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database

-- Niches
create table if not exists niches (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text default '',
  color text default '#8b5cf6',
  created_at timestamptz default now()
);

-- Leads
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text default '',
  niche text default '',
  city text default '',
  instagram text default '',
  whatsapp text default '',
  website text default '',
  status text not null default 'new' check (status in ('new','contacted','replied','interested','meeting','proposal','won','lost')),
  interest_level integer default 1 check (interest_level between 1 and 5),
  score integer default 0 check (score between 0 and 100),
  last_contacted_at date,
  next_followup_at date,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activities
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  type text not null check (type in ('message_sent','reply_received','call','meeting','note','status_change')),
  description text not null,
  created_at timestamptz default now()
);

-- Campaigns
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  niche text default '',
  description text default '',
  status text not null default 'active' check (status in ('active','paused','completed')),
  start_date date not null default current_date,
  end_date date,
  leads_count integer default 0,
  messages_sent integer default 0,
  replies integer default 0,
  meetings integer default 0,
  closes integer default 0,
  created_at timestamptz default now()
);

-- Campaign Leads junction
create table if not exists campaign_leads (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  status text default 'pending',
  created_at timestamptz default now(),
  unique(campaign_id, lead_id)
);

-- Message Templates
create table if not exists message_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  niche text default '',
  type text not null check (type in ('initial','followup','proposal','closing')),
  content text not null,
  created_at timestamptz default now()
);

-- Daily Metrics
create table if not exists daily_metrics (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date unique,
  messages_sent integer default 0,
  responses integer default 0,
  meetings integer default 0,
  closes integer default 0,
  goal_messages integer default 30,
  goal_meetings integer default 3
);

-- Enable Row Level Security
alter table leads enable row level security;
alter table activities enable row level security;
alter table campaigns enable row level security;
alter table niches enable row level security;
alter table message_templates enable row level security;
alter table daily_metrics enable row level security;

-- Policies (allow all for authenticated users - customize as needed)
create policy "Allow all for authenticated" on leads for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on activities for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on campaigns for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on niches for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on message_templates for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on daily_metrics for all using (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at on leads
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();
