-- Analysis sessions table
create table public.analysis_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  position text not null check (position in ('pitching', 'hitting', 'fielding', 'catching')),
  overall_score integer not null check (overall_score >= 0 and overall_score <= 100),
  summary text not null,
  checkpoints jsonb not null default '[]'::jsonb,
  drills jsonb not null default '[]'::jsonb,
  comparison jsonb not null default '[]'::jsonb,
  video_url text,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.analysis_sessions enable row level security;

-- Users can only see their own sessions
create policy "Users can view own sessions"
  on public.analysis_sessions for select
  using (auth.uid() = user_id);

-- Users can insert their own sessions
create policy "Users can insert own sessions"
  on public.analysis_sessions for insert
  with check (auth.uid() = user_id);

-- Storage bucket for videos
insert into storage.buckets (id, name, public) values ('videos', 'videos', true);

-- Storage policy: users can upload their own videos
create policy "Users can upload videos"
  on storage.objects for insert
  with check (bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policy: videos are publicly readable
create policy "Videos are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'videos');
