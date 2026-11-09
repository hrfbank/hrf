# HANDOFF — 2026-11-09

## المهمة الحالية
إعداد بيئة العمل (CLAUDE.md، السجلات، السكيلز، الإعدادات) خلص. المشروع: API على Vercel يولّد أسئلة ثقافة عامة عبر OpenAI ويخزّنها في Supabase.

## وين وصلنا
- [x] `CLAUDE.md` + `docs/PROGRESS.md` + `docs/DECISIONS.md` + `docs/HANDOFF.md`
- [x] سكيلز `handoff` و `checkpoint` و `update-log` و `token-saver` و `plan-first` في `.claude/skills/`
- [x] `.claude/settings.json` (صلاحيات + hooks)
- [ ] ← ابدأ من هنا: تجربة `api/generate-questions.ts` بـ 200 سؤال (ما انختبر)، أو البدء في `index.html`

## الملفات المهمة
- `api/generate-questions.ts` — الـ handler الوحيد الفعلي (المفاتيح 3-12، الـ prompt 14-24، OpenAI 26-49، Supabase 51-73)
- `api/generate.js`, `index.html` — فاضيين
- `CLAUDE.md` — قواعد العمل وجدول السكيلز
- `.claude/settings.json` — الصلاحيات و hooks

## معلومات لازم تعرفها
- متغيرات البيئة: `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`
- ما فيه `package.json` ولا اختبارات، فأوامر npm ما تشتغل
- 20 سكيل مذكورة في `CLAUDE.md` بدون ملفات (الموجود: handoff, checkpoint, update-log, token-saver, plan-first)
- قاعدة deny تمسك `git push --force` بس، مو `git push -f` ولا `--force` في آخر الأمر
- hook الـ prettier ما يشتغل لأن prettier مو مثبّت
- السكيلز والإعدادات تشتغل من الجلسة الجاية (ما انجرّبت)
- الفرع: `claude/adoring-keller-4o3w9x`

## أول أمر في الجلسة الجاية
اقرأ `docs/HANDOFF.md` وكمّل.
