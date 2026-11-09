# سجل التقدم

> يحدّثه Claude بعد كل مهمة. الأحدث في الأعلى.

## الحالة الحالية
- **شغّال عليه الآن:** —
- **التالي:** دفعات أسئلة جديدة حسب `docs/QUESTION_RULES.md` (سكيل `huroof-questions`). الأولوية: الحروف الناقصة (ث خ ذ ش ص ض ظ غ ق ه و)، الرياضة، والمستوى الصعب.
- **مشاكل معلّقة:** توزيع الصعوبة مايل للسهل (٢٤ سهل، ١٦ متوسط، ٢ صعب). ويكيبيديا محجوبة من الشبكة. Supabase مؤجل. نسخة Vercel القديمة من `api/generate-questions` لسه منشورة.

---

## 2026-11-09
- **انعمل:** قاعدة الأسئلة الحقيقية + الموقع داخل Claude.
  - `docs/QUESTION_RULES.md` + `scripts/validate-questions.mjs` (`npm run validate`) + سكيل `huroof-questions`.
  - `data/questions.json`: ٤٢ سؤال مدقق (كل واحد بمصدر، تم التحقق بـ WebSearch) + ٢ مرفوض مع السبب. ٨ مجالات، ١٧ حرف من ٢٨.
  - الموقع يقرأ من الملف مباشرة، وانحذف الوضع التجريبي و Supabase من الكود. منشور: https://claude.ai/artifact/ATCSxDzGuVWas9EgaxqXSS
- **ملاحظات:** `npm run validate` = ٠ خطأ. `npm run build` ينجح.

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
