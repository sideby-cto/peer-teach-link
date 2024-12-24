create table public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  teacher_id uuid references auth.users(id) not null,
  content text not null,
  is_ai_generated boolean default false,
  is_approved boolean default false,
  original_transcript_id uuid,
  likes_count integer default 0
);

-- Set up Row Level Security (RLS)
alter table public.posts enable row level security;

-- Create policies
create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Authenticated users can insert posts"
  on public.posts for insert
  to authenticated
  with check (true);

create policy "Users can update their own posts"
  on public.posts for update
  to authenticated
  using (teacher_id = auth.uid());