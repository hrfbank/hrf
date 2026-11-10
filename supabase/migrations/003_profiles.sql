-- 003_profiles: ملف لكل صاحب لعبة يسجّل دخوله (Apple / Google)
-- ينشأ تلقائياً عند أول تسجيل دخول.

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  games_played int not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- كل لاعب يشوف ويعدّل ملفه فقط
create policy "own profile read" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "own profile update" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

grant select, update on public.profiles to authenticated;

-- إنشاء الملف تلقائياً عند التسجيل
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
