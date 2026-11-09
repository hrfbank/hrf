# CLAUDE.md

## عن المشروع
حروف (hrf): موقع قاعدة بيانات أسئلة ثقافية عربية، كل سؤال جوابه يبدأ بحرف معيّن. لاحقاً يتحول لتطبيق لعبة. التقنيات: React 18 + Vite 5 + TypeScript + react-router. البيانات حالياً في `data/questions.json` والموقع منشور كـ Artifact داخل Claude. Supabase و Capacitor لاحقاً.

## الأوامر
- تشغيل: `npm run dev`
- بناء + فحص الأنواع: `npm run build`
- فحص الأسئلة (إلزامي قبل أي حفظ للأسئلة): `npm run validate`
- صفحة Artifact داخل Claude: `npm run build && npm run artifact` ← `dist/huroof.html`، وتنشر على نفس الرابط: https://claude.ai/artifact/ATCSxDzGuVWas9EgaxqXSS
- ما فيه اختبارات ولا lint بعد.

## هيكل المجلدات
- `data/questions.json` قاعدة الأسئلة (المصدر الوحيد للحقيقة حالياً)
- `docs/QUESTION_RULES.md` شروط قبول الأسئلة (إلزامية)
- `scripts/` المدقق وبناء الـ Artifact
- `src/pages/` الصفحات، `src/components/` المكونات، `src/lib/` البيانات (api, demo, letters)
- `src/styles.css` كل التصميم (ألوان الوضعين في `:root`)
- `supabase/migrations/` ملفات SQL (تنشغّل يدوياً في Supabase SQL Editor بالترتيب)
- `docs/` السجلات والقرارات

## وين أغيّر وش (كل شي قابل للتعديل بسهولة)
| أبي أغيّر | الملف |
|---|---|
| قواعد اللعبة (المهلة، اللوحة، الجولات، العقوبة، المزايا الإضافية) | `src/game/config.ts` |
| الأصوات والموسيقى | `src/game/sound.ts` |
| الفئات (إضافة/حذف/تسمية/أولوية) | `data/questions.json` ← `categories` |
| الأسئلة | `data/questions.json` ← `questions` (ثم `npm run validate`) |
| شروط قبول الأسئلة | `docs/QUESTION_RULES.md` + `scripts/validate-questions.mjs` |
| الألوان والخطوط والشكل | `src/styles.css` (أول الملف) |

## طريقة العمل (إلزامي)
1. **ابدأ كل جلسة** بقراءة `docs/HANDOFF.md` ثم `docs/PROGRESS.md` و `docs/DECISIONS.md` قبل أي تعديل.
2. **قبل أي مهمة كبيرة** اكتب خطة قصيرة (3-7 خطوات) ثم نفّذ.
3. **بعد كل مهمة** حدّث `docs/PROGRESS.md`: وش انعمل، وش باقي، أي مشكلة معلّقة.
4. **أي قرار تصميمي أو تقني** سجّله في `docs/DECISIONS.md` مع السبب.
5. شغّل البناء والاختبارات قبل ما تقول "خلصت". لا تدّعي النجاح بدون تشغيل.
6. commits صغيرة برسائل واضحة: `feat:` / `fix:` / `refactor:` / `docs:`.
7. لا تحذف ملفات أو تغيّر هيكل البيانات بدون ما تذكر السبب في الـ commit.

## قواعد الكود
- عدّل أقل قدر ممكن من الكود لتحقيق المطلوب، لا تعيد كتابة ما لم يُطلب.
- اتبع أسلوب الملفات الموجودة (التسمية، التنسيق، طريقة الاستيراد).
- لا تضف مكتبات جديدة بدون ذكرها وسببها.
- مكونات صغيرة، وأسماء واضحة بالإنجليزي للكود.

## اللغة والواجهة
- النصوص الظاهرة للمستخدم بالعربية الفصحى المبسطة.
- الواجهة `dir="rtl"`، واستخدم `margin-inline-start` / `padding-inline-end` بدل left/right.
- تأكد إن الأرقام والخطوط العربية تظهر صح.
- ردودك لي في المحادثة: بالعربي ومختصرة.

## ممنوع
- لا تعدّل `.env` ولا تطبع مفاتيح أو أسرار.
- لا تعمل `git push --force`.
- لا تغيّر ملفات البيانات الكبيرة يدوياً إذا فيه سكربت مخصص لها.

## السكيلز
- طبّق **token-saver** دائماً، و **checkpoint** بعد كل خطوة، و **handoff** قبل نهاية الجلسة.
- طبّق **human-writing** على أي نص، و **human-design** على أي واجهة.

| السكيل | كلمة التشغيل |
|---|---|
| token-saver | دائماً |
| huroof-questions | أسئلة / ولّد أسئلة / راجع الأسئلة |
| checkpoint | احفظ |
| handoff | سلّم / بكمل بعدين |
| update-log | سجّل |
| plan-first | خطط |
| review-before-commit | راجع |
| arabic-ui-check | افحص العربي / RTL |
| human-writing | صياغة / اكتب نص |
| human-design | صمم / واجهة |
| debug-systematic | باق / خطأ / ما يشتغل |
| test-first | اختبار / TDD |
| ship-check | جاهز للنشر / انشر |
| script-writer | سيناريو / سكربت / فيديو |
| story-structure | قصة / حبكة / شخصيات |
| design-system | هوية / ألوان / نظام تصميم |
| ux-review | راجع التصميم / UX |
| svg-illustration | ارسم / أيقونة / SVG |
| image-prompt | برومبت صورة |
| game-design-doc | فكرة لعبة / GDD |
| game-balance | توازن / صعوبة / مستويات |
| game-feel | إحساس / حركة اللعبة |
| report-writing | تقرير / ملخص تنفيذي |
| data-analysis | حلّل / بيانات |
| deep-research | ابحث / مصادر |
| fact-check | تحقق / صحح المعلومات |
