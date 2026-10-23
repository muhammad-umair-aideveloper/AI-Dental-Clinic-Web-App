-- Migrate appointment, patient, user, inquiry, X-ray, and secure-link
-- persistence away from local JSON and process-local demo stores.

create table if not exists patients (
  phone text primary key,
  name text not null,
  email text,
  notes text not null default '',
  no_show_count integer not null default 0 check (no_show_count >= 0),
  advance_token_required boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null unique,
  phone text not null default '',
  password_hash text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

alter table appointments add column if not exists chair text;
alter table appointments add column if not exists whatsapp_reminder_sent boolean not null default false;
alter table appointments add column if not exists reminder_sent_at timestamptz;
alter table appointments add column if not exists source text not null default 'form';
alter table appointments add column if not exists patient_phone text;
alter table appointments add column if not exists whatsapp_consent boolean not null default false;

update appointments
set patient_phone = phone
where patient_phone is null;

insert into patients (phone, name)
select distinct phone, name
from appointments
where phone is not null
on conflict (phone) do nothing;

update appointments
set chair = case
  when lower(coalesce(reason, '')) like '%implant%'
    or lower(coalesce(reason, '')) like '%root canal%'
    or lower(coalesce(reason, '')) like '%rct%'
    or lower(coalesce(reason, '')) like '%surgical%'
    or lower(coalesce(reason, '')) like '%extraction%'
    or lower(coalesce(reason, '')) like '%surgery%'
  then 'chair-1'
  else 'chair-2'
end
where chair is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'appointments_patient_phone_fkey'
  ) then
    alter table appointments
      add constraint appointments_patient_phone_fkey
      foreign key (patient_phone) references patients(phone);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chk_appointments_source'
  ) then
    alter table appointments
      add constraint chk_appointments_source
      check (source in ('form', 'chatbot'));
  end if;
end $$;

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text not null default '',
  status text not null default 'unread' check (status in ('unread', 'read', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists patient_xrays (
  id uuid primary key default gen_random_uuid(),
  patient_phone text not null references patients(phone) on delete cascade,
  title text not null,
  category text not null check (category in ('OPG', 'Periapical', 'Bitewing', 'Intraoral Photo')),
  date date not null,
  url text not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists secure_patient_links (
  token text primary key,
  patient_phone text not null references patients(phone) on delete cascade,
  expires_at timestamptz not null,
  max_views integer not null check (max_views > 0),
  views_left integer not null check (views_left >= 0),
  revoked boolean not null default false,
  access_logs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_appointments_created_at on appointments (created_at desc);
create index if not exists idx_appointments_patient_phone on appointments (patient_phone);
create index if not exists idx_patients_created_at on patients (created_at desc);
create index if not exists idx_inquiries_created_at on inquiries (created_at desc);
create index if not exists idx_patient_xrays_patient_phone on patient_xrays (patient_phone);

alter table patients enable row level security;
alter table users enable row level security;
alter table inquiries enable row level security;
alter table patient_xrays enable row level security;
alter table secure_patient_links enable row level security;

drop policy if exists "Allow anonymous patient inserts" on patients;
create policy "Allow anonymous patient inserts"
  on patients for insert to anon, authenticated
  with check (true);

drop policy if exists "Allow anonymous patient upserts" on patients;
create policy "Allow anonymous patient upserts"
  on patients for update to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow anonymous appointment inserts" on appointments;
create policy "Allow anonymous appointment inserts"
  on appointments for insert to anon, authenticated
  with check (true);

drop policy if exists "Allow appointment availability reads" on appointments;
create policy "Allow appointment availability reads"
  on appointments for select to anon, authenticated
  using (true);

drop policy if exists "Allow anonymous inquiry inserts" on inquiries;
create policy "Allow anonymous inquiry inserts"
  on inquiries for insert to anon, authenticated
  with check (true);

-- Existing local users and demo records are imported idempotently.
insert into users (id, name, email, phone, password_hash, role, created_at)
values
  ('usr-admin-001', 'Dr. Admin (Clinic Staff)', 'admin@lahoredental.pk', '03001234567',
   '12d073e78033f03d7fad7eee0f83a8c0:e9de3622ef0322bdd2a52e2e700996e1f93c126883389b84eb3791a6c0e64d7c9e9bf5f0210643bb67b388d4e7817f699702363ed4ad49b9c39cee3d62add906',
   'admin', '2026-01-01T00:00:00Z'),
  ('usr-staff-002', 'Clinic Reception Staff', 'staff@lahoredental.pk', '03001234567',
   '12d073e78033f03d7fad7eee0f83a8c0:e9de3622ef0322bdd2a52e2e700996e1f93c126883389b84eb3791a6c0e64d7c9e9bf5f0210643bb67b388d4e7817f699702363ed4ad49b9c39cee3d62add906',
   'admin', '2026-01-01T00:00:00Z')
on conflict (id) do nothing;

insert into patients (phone, name, email, notes, no_show_count, advance_token_required, created_at)
values
  ('03001234567', 'Tariq Mahmood', 'tariq.m@example.com',
   'Patient prefers late morning appointments. Sensitive to cold water in lower right quadrant. Planned implant site #46.',
   0, false, '2026-08-14T10:00:00Z'),
  ('03219876543', 'Hina Naveed', 'hina.n@example.com',
   'Mild gingivitis with calculus in lower anterior lingual surfaces. Highly compliant with home oral hygiene instructions.',
   1, false, '2026-09-10T14:30:00Z'),
  ('03335558899', 'Kamran Siddiqui', null,
   'Missed two consecutive appointments without notice. Requires Rs. 2,000 advance confirmation token before blocking chair time.',
   2, true, '2026-07-22T11:15:00Z')
on conflict (phone) do nothing;

insert into inquiries (id, name, phone, message, status, created_at)
values
  ('00000000-0000-0000-0000-000000000001', 'Usman Ali', '03001234567',
   'Looking for consultation on Saturday for clear aligners.', 'unread', now() - interval '3 hours'),
  ('00000000-0000-0000-0000-000000000002', 'Fatima Noor', '03451239874',
   'Do you have painless options for 7-year-old child cavity filling?', 'read', now() - interval '8 hours')
on conflict (id) do nothing;
