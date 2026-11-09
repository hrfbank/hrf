# HANDOFF — 2026-11-09

## المهمة الحالية
API (Vercel serverless) يولّد أسئلة ثقافة عامة عبر OpenAI ويخزّنها في جدول `questions` في Supabase.

## وين وصلنا
- [x] `api/generate-questions.ts` شغّال كمنطق: توليد ← تنظيف JSON ← إدخال في Supabase
- [x] عدد الأسئلة تغيّر من 20 إلى 200 (آخر commit: 2901e5e)
- [ ] ← ابدأ من هنا: تجربة الـ endpoint فعلياً بـ 200 سؤال والتأكد إن الرد ما ينقطع (ما تم اختباره في هذه الجلسة)
- [ ] `index.html` و `api/generate.js` فاضيين — لم يُكتب فيهم شي بعد

## الملفات المهمة
- `api/generate-questions.ts` — الـ handler الوحيد الفعلي
  - 3-12: قراءة وتنظيف المفاتيح (يحذف أحرف غير ASCII مثل RTL mark)
  - 14-24: الـ prompt (ملاحظة: `]Generate` بدون سطر جديد في السطر 20)
  - 26-49: طلب OpenAI (`gpt-4.1-mini`) وتحليل JSON
  - 51-73: تجهيز الحقول (question, answer, category, letter) والإدخال في Supabase
- `api/generate.js`, `index.html` — فاضيين

## معلومات لازم تعرفها
- متغيرات البيئة المطلوبة: `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`
- `letter` = أول حرف من الإجابة بحروف كبيرة
- لو JSON غير صالح يرجّع 500 مع `raw` (رد الـ AI الخام)
- ما فيه package.json ولا tests في الريبو
- الفرع: `claude/adoring-keller-4o3w9x`

## أول أمر في الجلسة الجاية
اقرأ `api/generate-questions.ts`، ثم قرّر: تجربة الـ endpoint على Vercel، أو البدء في `index.html`.
