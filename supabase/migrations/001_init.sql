-- 001_init: المجالات والأسئلة
-- شغّله مرة وحدة في Supabase: SQL Editor ← New query ← الصق ← Run

-- الجدول القديم (من نسخة generate-questions) ينحفظ باسم جديد بدل ما ينحذف
do $$
begin
  if to_regclass('public.questions') is not null
     and to_regclass('public.questions_old') is null then
    alter table public.questions rename to questions_old;
  end if;
end $$;

create extension if not exists pg_trgm;

-- المجالات
create table public.categories (
  id          bigint generated always as identity primary key,
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  description text,
  icon        text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- الأسئلة
create table public.questions (
  id           bigint generated always as identity primary key,
  category_id  bigint not null references public.categories(id) on delete restrict,
  question     text not null check (length(trim(question)) > 0),
  answer       text not null check (length(trim(answer)) > 0),
  letter       text not null check (letter ~ '^[ابتثجحخدذرزسشصضطظعغفقكلمنهوي]$'),
  difficulty   smallint not null default 2 check (difficulty between 1 and 3),
  status       text not null default 'pending'
               check (status in ('pending', 'verified', 'rejected')),
  review_note  text,
  source       text,
  created_at   timestamptz not null default now(),
  verified_at  timestamptz,
  unique (category_id, question)
);

create index questions_category_letter_idx on public.questions (category_id, letter) where status = 'verified';
create index questions_status_idx          on public.questions (status);
create index questions_question_trgm_idx   on public.questions using gin (question gin_trgm_ops);
create index questions_answer_trgm_idx     on public.questions using gin (answer gin_trgm_ops);

-- عدد الأسئلة المدققة لكل مجال (للصفحة الرئيسية وبطاقات المجالات)
create view public.category_stats
with (security_invoker = true) as
select c.id, c.slug, c.name, c.description, c.icon, c.sort_order,
       count(q.id) filter (where q.status = 'verified') as question_count
from public.categories c
left join public.questions q on q.category_id = c.id
group by c.id;

-- الصلاحيات: الزوار يقرون فقط، والأسئلة المدققة فقط.
-- الإضافة والتعديل من سكربت التوليد بمفتاح service_role (يتجاوز RLS).
alter table public.categories enable row level security;
alter table public.questions  enable row level security;

create policy "public read categories" on public.categories
  for select to anon, authenticated using (true);

create policy "public read verified questions" on public.questions
  for select to anon, authenticated using (status = 'verified');

grant select on public.categories, public.questions, public.category_stats to anon, authenticated;

-- المجالات الأولى (تجربة)
insert into public.categories (slug, name, description, sort_order) values
  ('general',          'معلومات عامة',      'أسئلة ثقافية متنوعة',              1),
  ('kuwait',           'الكويت',            'تاريخ الكويت وجغرافيتها ومعالمها', 2),
  ('islamic-history',  'التاريخ الإسلامي',  'أحداث وشخصيات من التاريخ الإسلامي', 3),
  ('science',          'العلوم',            'فيزياء وكيمياء وأحياء وفلك',        4),
  ('geography',        'الجغرافيا',         'دول وعواصم وتضاريس',                5);
