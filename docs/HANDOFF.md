# HANDOFF — 2026-11-09

## المهمة الحالية
"حروف": بنك أسئلة ثقافية عربية لعبة حروف. الجودة أهم من العدد. الموقع منشور داخل Claude.

## وين وصلنا
- [x] معايير القبول `docs/QUESTION_RULES.md` + المدقق `npm run validate`
- [x] `data/questions.json`: ٤٢ مدقق بمصادر + ٢ مرفوض
- [x] الموقع منشور: https://claude.ai/artifact/ATCSxDzGuVWas9EgaxqXSS
- [ ] ← ابدأ من هنا: دفعة أسئلة جديدة (سكيل `huroof-questions`) تغطي الحروف الناقصة والمستوى الصعب

## الملفات المهمة
- `data/questions.json` — كل الأسئلة (status/source/verified_at/review_note)
- `docs/QUESTION_RULES.md` — الشروط الإلزامية
- `scripts/validate-questions.mjs` — الفحص الآلي
- `scripts/build-artifact.mjs` — يبني `dist/huroof.html` للنشر
- `src/lib/api.ts` — الموقع يقرأ الأسئلة المدققة من الملف

## معلومات لازم تعرفها
- النشر: `npm run build && npm run artifact` ثم Artifact publish لـ `dist/huroof.html` مع `url` أعلاه (عشان نفس الرابط)
- ويكيبيديا محجوبة (WebFetch و curl). التحقق بـ WebSearch
- لا تعتمد سؤال `verified` بدون مصدر تحققت منه في نفس الجلسة
- الحروف الناقصة: ث خ ذ ش ص ض ظ غ ق ه و
- Supabase (`supabase/migrations/`) مؤجل، الكود ما يستخدمه
- الفرع: `claude/adoring-keller-4o3w9x`

## أول أمر في الجلسة الجاية
`npm install && npm run validate`
