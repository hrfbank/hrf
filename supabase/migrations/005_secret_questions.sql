-- 005_secret_questions: بنك الأسئلة سري.
-- • ما أحد يقرا جدول الأسئلة إلا صاحب اللعبة (جدول admins).
-- • اللعبة ما تحمّل البنك كامل: تطلب سؤال واحد لما تنفتح الخلية (next_question)،
--   من الفئات المختارة بس، وما طلع للحساب قبل، وتسجّله في seen_questions.
-- • عدد الأسئلة الجديدة لكل حرف/فئة (بدون نص) متاح للعبة عشان تبني اللوحة.
-- يحتاج 001 و 004 قبله.

-- أصحاب اللعبة
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- ما فيه سياسات: ما أحد يقرا أو يعدّل الجدول من المتصفح. الإضافة من SQL Editor:
--   insert into public.admins (user_id) select id from auth.users where email = 'بريدك';

create or replace function public.is_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to authenticated;

-- الأسئلة: قراءة لصاحب اللعبة بس (بدل القراءة العامة في 001)
drop policy if exists "public read verified questions" on public.questions;
create policy "admin read questions" on public.questions
  for select to authenticated using (public.is_admin());
revoke select on public.questions from anon;

-- عدد الأسئلة لكل فئة (بدون نص الأسئلة) يبقى متاح للكل
alter view public.category_stats set (security_invoker = false);

-- عدد الأسئلة الجديدة على الحساب لكل حرف في الفئات المختارة (لبناء اللوحة)
create or replace function public.fresh_letter_counts(p_categories bigint[])
returns table (letter text, n int)
language sql stable
security definer set search_path = public
as $$
  select q.letter, count(*)::int
  from public.questions q
  where q.status = 'verified'
    and q.category_id = any (p_categories)
    and not exists (
      select 1 from public.seen_questions s
      where s.user_id = auth.uid() and s.question_id = q.id
    )
  group by q.letter;
$$;

-- سؤال واحد للخلية: من الفئات المختارة، ما طلع للحساب قبل، والفئة الأقل استخداماً في المباراة أولاً.
-- p_match_used: الأسئلة اللي طلعت في المباراة الحالية (لتوزيع الفئات بالتساوي).
create or replace function public.next_question(p_letter text, p_categories bigint[], p_match_used bigint[] default '{}')
returns table (id bigint, category_id bigint, question text, answer text, letter text, difficulty smallint)
language plpgsql
security definer set search_path = public
as $$
declare
  v_id bigint;
begin
  if auth.uid() is null then
    raise exception 'لازم تسجيل الدخول';
  end if;

  with used_per_cat as (
    select q.category_id, count(*) as n
    from public.questions q
    where q.id = any (p_match_used)
    group by q.category_id
  )
  select q.id into v_id
  from public.questions q
  left join used_per_cat u on u.category_id = q.category_id
  where q.status = 'verified'
    and q.letter = p_letter
    and q.category_id = any (p_categories)
    and not exists (
      select 1 from public.seen_questions s
      where s.user_id = auth.uid() and s.question_id = q.id
    )
  order by coalesce(u.n, 0), random()
  limit 1;

  if v_id is null then
    return; -- ما فيه سؤال جديد: اللعبة تعرض التنبيه
  end if;

  insert into public.seen_questions (user_id, question_id)
  values (auth.uid(), v_id)
  on conflict do nothing;

  return query
    select q.id, q.category_id, q.question, q.answer, q.letter, q.difficulty
    from public.questions q where q.id = v_id;
end;
$$;

revoke execute on function public.fresh_letter_counts(bigint[]) from anon, public;
revoke execute on function public.next_question(text, bigint[], bigint[]) from anon, public;
grant execute on function public.fresh_letter_counts(bigint[]) to authenticated;
grant execute on function public.next_question(text, bigint[], bigint[]) to authenticated;
