# سجل التقدم

> يحدّثه Claude بعد كل مهمة. الأحدث في الأعلى.

## الحالة الحالية
- **شغّال عليه الآن:** المرحلة 1 (قاعدة البيانات) — الملف جاهز، ينتظر تشغيله في Supabase.
- **التالي:** المرحلة 2: سكربت توليد + تحقق الأسئلة. ثم المرحلة 3: الموقع (Vite + React).
- **مشاكل معلّقة:** قرار "ال" التعريف في الحرف. مفتاح Supabase `service_role` ما انضاف لبيئة Claude. نسخة Vercel القديمة من `api/generate-questions` لسه منشورة لين ينعمل deploy جديد.

---

## 2026-11-09
- **انعمل:** بداية المشروع الجديد "حروف".
  - `supabase/migrations/001_init.sql`: جداول `categories` و `questions` + view `category_stats` + RLS (الزوار يقرون المدقق فقط) + 5 مجالات أولية. انختبر على PostgreSQL 16 محلي.
  - حذف `api/` (رابط عام يصرف من رصيد OpenAI).
  - مفتاح OpenAI انحفظ في بيئة Claude `Default` (يشتغل).
- **ملاحظات:** الـ migration ما انشغّل على Supabase الحقيقي بعد.

- **انعمل:** إعداد CLAUDE.md والسجلات.
  - `CLAUDE.md` (قواعد العمل)، `docs/HANDOFF.md`، `docs/PROGRESS.md`، `docs/DECISIONS.md`.
  - سكيلز `handoff` و `checkpoint` و `update-log` و `token-saver` و `plan-first` في `.claude/skills/`.
  - `.claude/settings.json`: صلاحيات + hook بداية الجلسة + prettier بعد التعديل (لو مثبّت).
- **ملاحظات:** لا تغييرات على الكود.

## 2026-02-21
- **انعمل:** إنشاء `api/generate-questions.ts` (توليد أسئلة عبر OpenAI وتخزينها في Supabase)، تحسين تحليل JSON ومعالجة الأخطاء، رفع عدد الأسئلة من 20 إلى 200. إنشاء `api/generate.js` و `index.html` فاضيين.
- **ملاحظات:** —
