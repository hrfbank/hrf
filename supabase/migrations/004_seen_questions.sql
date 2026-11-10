-- 004_seen_questions: الأسئلة اللي طلعت لكل حساب، عشان ما تتكرر له.
-- نفس السؤال عادي يطلع لحساب ثاني.

create table public.seen_questions (
  user_id     uuid not null references auth.users(id) on delete cascade,
  question_id int  not null,
  seen_at     timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index seen_questions_user_idx on public.seen_questions (user_id, seen_at);

alter table public.seen_questions enable row level security;

-- كل حساب يشوف ويسجّل أسئلته فقط
create policy "own seen read" on public.seen_questions
  for select to authenticated using (auth.uid() = user_id);
create policy "own seen insert" on public.seen_questions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "own seen update" on public.seen_questions
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own seen delete" on public.seen_questions
  for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.seen_questions to authenticated;
