-- 002_letter_stats: عدد الأسئلة المدققة لكل حرف في كل مجال (لشريط الحروف)
create view public.letter_stats
with (security_invoker = true) as
select category_id, letter, count(*) as question_count
from public.questions
where status = 'verified'
group by category_id, letter;

grant select on public.letter_stats to anon, authenticated;
