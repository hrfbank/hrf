# سجل التقدم

> يحدّثه Claude بعد كل مهمة. الأحدث في الأعلى.

## الحالة الحالية
- **شغّال عليه الآن:** —
- **التالي:** (١) المستخدم يشغّل `001_init.sql` ثم `002_letter_stats.sql` في Supabase. (٢) سكربت توليد + تحقق الأسئلة (المرحلة 2). (٣) نشر على Vercel مع `VITE_SUPABASE_URL` و `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **مشاكل معلّقة:** قرار "ال" التعريف في الحرف. مفتاح `service_role` ما انضاف لبيئة Claude. نسخة Vercel القديمة من `api/generate-questions` لسه منشورة.

---

## 2026-11-09
- **انعمل:** الموقع (المرحلة 3) بتصميم "دفتر الحروف".
  - Vite + React + TS. صفحات: الرئيسية (إحصائيات، سؤال اليوم، المجالات، الحروف)، المجالات، المجال (بحث + فلتر حرف)، الحروف، الحرف، البحث.
  - `supabase/migrations/002_letter_stats.sql` (عدد الأسئلة لكل حرف).
  - `npm run build` ينجح. انفحص بالمتصفح (وضع تجريبي) على سطح المكتب والجوال والوضع الليلي: بدون أخطاء ولا تمرير أفقي.
- **ملاحظات:** ما انجرّب مع Supabase الحقيقي (الجداول ما انشأت بعد).

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
