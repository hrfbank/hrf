# HANDOFF — 2026-11-09

## المهمة الحالية
موقع "حروف": بنك أسئلة ثقافية عربية (كل جواب يبدأ بحرف)، لاحقاً تطبيق لعبة. Vite + React + TS + Supabase.

## وين وصلنا
- [x] قاعدة البيانات: `supabase/migrations/001_init.sql` و `002_letter_stats.sql` (انختبرت على Postgres محلي)
- [x] الموقع بتصميم "دفتر الحروف" (كل الصفحات، وضع ليلي، جوال)
- [ ] ← ابدأ من هنا: المستخدم يشغّل الـ migrations في Supabase، ثم سكربت توليد + تحقق الأسئلة
- [ ] نشر على Vercel

## الملفات المهمة
- `src/lib/api.ts` — كل استعلامات Supabase
- `src/lib/demo.ts` — بيانات الوضع التجريبي
- `src/styles.css` — التصميم كامل (الألوان في `:root` أول الملف)
- `src/pages/` و `src/components/`
- `docs/DECISIONS.md` — قرارات التصميم والبيانات

## معلومات لازم تعرفها
- `npm run dev:demo` يشغّل الموقع بدون Supabase
- الزوار يشوفون الأسئلة `verified` فقط (RLS). الإضافة بمفتاح `service_role` من سكربت محلي
- مفتاح OpenAI محفوظ في بيئة Claude `Default`. مفتاح Supabase `service_role` لا
- قرار مفتوح: هل "ال" التعريف تُحسب في الحرف؟
- نسخة Vercel القديمة من `api/generate-questions` لسه منشورة (رابط عام يصرف رصيد OpenAI)
- الفرع: `claude/adoring-keller-4o3w9x`

## أول أمر في الجلسة الجاية
`npm install && npm run dev:demo`، ثم اقرأ "التالي" في `docs/PROGRESS.md`.
