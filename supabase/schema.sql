-- Lahore Dental: Appointments Table Schema & Security Policies

-- 1. Create table
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  date date not null,
  time time not null,
  reason text,
  status text default 'confirmed',
  language text default 'en',
  created_at timestamptz default now()
);

-- 2. Indexes for fast availability queries
create index if not exists idx_appointments_date on appointments (date);
create index if not exists idx_appointments_phone on appointments (phone);

-- 3. Row Level Security (RLS)
alter table appointments enable row level security;

-- Allow anon service insert (e.g. from website booking engine)
create policy "Allow anonymous inserts"
  on appointments
  for insert
  with check (true);

-- Allow reading appointments for availability verification
create policy "Allow read access for availability"
  on appointments
  for select
  using (true);
