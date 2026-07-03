create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  first_name text,
  age integer check (age is null or age between 13 and 120),
  height_inches numeric check (height_inches is null or height_inches between 36 and 96),
  current_weight_lbs numeric check (current_weight_lbs is null or current_weight_lbs between 50 and 700),
  goal_weight_lbs numeric check (goal_weight_lbs is null or goal_weight_lbs between 50 and 700),
  primary_goal text,
  activity_level text,
  work_style text,
  dietary_preference text,
  foods_to_avoid text,
  calorie_target integer check (calorie_target is null or calorie_target between 800 and 6000),
  protein_target integer check (protein_target is null or protein_target between 20 and 400),
  sms_consent boolean not null default false,
  phone_number text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'none',
  price_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_path text not null,
  thumbnail_path text,
  context text,
  analysis jsonb not null,
  meal_name text not null,
  calorie_min integer not null check (calorie_min >= 0),
  calorie_max integer not null check (calorie_max >= calorie_min),
  protein_grams numeric not null check (protein_grams >= 0),
  meal_score integer not null check (meal_score between 1 and 10),
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  duration_ms integer,
  created_at timestamptz not null default now()
);

create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_lbs numeric not null check (weight_lbs between 50 and 700),
  note text,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  meal_id uuid references public.meals(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.app_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone_number text,
  primary_goal text,
  interest_level text,
  source text,
  referral text,
  tried_free_scan boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.meals enable row level security;
alter table public.weight_entries enable row level security;
alter table public.coach_messages enable row level security;
alter table public.app_events enable row level security;
alter table public.waitlist_entries enable row level security;

create policy "profiles own rows" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subscriptions own read" on public.subscriptions for select using (auth.uid() = user_id);
create policy "meals own rows" on public.meals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weight own rows" on public.weight_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "coach own rows" on public.coach_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "events own insert" on public.app_events for insert with check (auth.uid() = user_id);
create policy "waitlist public insert" on public.waitlist_entries for insert with check (true);

create index meals_user_created_idx on public.meals(user_id, created_at desc);
create index weight_user_logged_idx on public.weight_entries(user_id, logged_at desc);
create index coach_user_created_idx on public.coach_messages(user_id, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('meal-photos', 'meal-photos', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false;

create policy "meal photos owner read" on storage.objects for select using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "meal photos owner insert" on storage.objects for insert with check (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "meal photos owner delete" on storage.objects for delete using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
