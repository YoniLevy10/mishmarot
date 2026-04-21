-- Supabase schema for Mishmarot (profiles + shifts)

create table if not exists profiles (
  id uuid references auth.users primary key,
  role text default 'מאבטח חמוש',
  hourly_rate numeric default 0,
  base_daily_hours numeric default 6.67,
  ashel_rate numeric default 28,
  travel_daily numeric default 0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
drop policy if exists "Users can manage own profile" on profiles;
create policy "Users can manage own profile"
  on profiles for all using (auth.uid() = id);

create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  shift_type text default 'נוכחות', -- נוכחות / תפקיד / עפ.הסכם
  ashel boolean default true,
  notes text,
  created_at timestamptz default now()
);

alter table shifts enable row level security;
drop policy if exists "Users can manage own shifts" on shifts;
create policy "Users can manage own shifts"
  on shifts for all using (auth.uid() = user_id);

create index if not exists shifts_user_id_date_idx on shifts(user_id, date);

