# PROGRESS

## 2026-11-09
- إضافة `docs/HANDOFF.md` و `docs/PROGRESS.md` (لا تغييرات على الكود في هذه الجلسة).
- إضافة `CLAUDE.md` (قواعد العمل) و `docs/DECISIONS.md` (فاضي).
- حفظ سكيل `handoff` في `.claude/skills/handoff/SKILL.md`.
- إضافة سكيلز `checkpoint` و `update-log` في `.claude/skills/`.
- إضافة `.claude/settings.json`: صلاحيات (allow/deny) + hook عند بداية الجلسة يعرض HANDOFF والسجل + prettier بعد كل تعديل (لو مثبّت).

## 2026-02-21
- إنشاء `api/generate-questions.ts`: توليد أسئلة عبر OpenAI وتخزينها في Supabase.
- تحسين تحليل JSON ومعالجة الأخطاء، ورفع عدد الأسئلة من 20 إلى 200.
- إنشاء `api/generate.js` و `index.html` (فاضيين).
