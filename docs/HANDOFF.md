# HANDOFF — 2026-11-26

## المهمة الحالية
«حروف»: بنك أسئلة نصية (٤٣٦ مدقق) + أسئلة صور داخل اللعبة نفسها (٩٩ تنتظر مراجعة صاحب اللعبة في `#/review`).
الموقع منشور: https://claude.ai/artifact/ATCSxDzGuVWas9EgaxqXSS (انشر بـ `npm run build && npm run artifact` ثم Artifact publish مع url ومع ملفات الصور الجديدة من dist/ عن طريق files/root).

## أول شي في الجلسة الجديدة
1. تأكد من المتغيرات: `echo ${HRF_CONTACT:+ok}` و `echo ${GOOGLE_MAPS_KEY:+ok}` (لا تطبع القيم).
2. `npm install && npm run validate` (يفحص النصوص + إن كل أسئلة الصور موجودة بصورها).
3. بيئة Python للصور: `python3 -m venv /tmp/imgvenv && /tmp/imgvenv/bin/pip install mediapipe pillow` + `apt-get install -y libegl1 libgles2 libgl1`.

## وين وصلنا في الصور (tools/images)
- `build.py` + `sets.json`: كل فئة صور = مجموعة. الأنواع: kuwait_area_shape، country_shape، flag، logo (أيقونات، قص بس)، logo_symbol (الرمز بدون الاسم، يدعم masks لشيل اسم داخل الرمز)، logo_colors، celebrity_eyes (photos.py: شريط العيون والحواجب، تلميحات يدوية في `clues`).
- `wiki.py`: Wikidata/Commons مع كاش، معدل `HRF_RATE`، الإيميل من `HRF_CONTACT`. ويكيميديا كانت ترجع 429 كثير بدون إيميل.
- `maps.py`: خرايط لوكيشن مرسومة من OSM (احتياط). الخطة: Google Maps Static API بالمفتاح `GOOGLE_MAPS_KEY` (مفعّلة، بس كانت تنتظر ربط الفوترة على مشروع My First Project).
- حماية: build.py يقفل الملف، يوقف إذا الأسئلة نقصت، ويسوي نسخة احتياطية في tools/images/backups.

## الباقي (بالترتيب)
1. **المشاهير**: أعد تشغيل `HRF_RATE=4 /tmp/imgvenv/bin/python tools/images/build.py celeb` بعد ما يوصل HRF_CONTACT (٥ نجحوا، ١٩ رفضوا لصور صغيرة أو 429). فكّر في TMDB إذا ضاف المستخدم `TMDB_KEY`.
2. **السيارات** بأمثلة المستخدم: جزء مميز بدون شعار (ليت/شبك/جنط)، السيارة بدون شعار، الظل، الداخلية بعد شيل الشعار، القطع، اسم الموديل بخطه (911). صور Commons في /tmp/cars (قد تكون انمسحت).
3. **اللوكيشن**: خريطة قوقل + دبوس أحمر، اسم المكان مخفي، الجواب الاسم جنب الدبوس.
4. **الكويت**: مخطط المنطقة بقطعها، لوحة دليل القطع (نرسمها من OSM)، مطعم ← المنطقة، معلم كويتي.
5. **سياحة وسفر**: كولاج ٢-٤ صور للمكان، الجواب المدينة/الدولة.
6. شعارات: Dole وشركات الأفلام (سوني، باراماونت...) والفاخرة (فيرساتشي، هيرميس، توري بيرتش) من Commons.

## قواعد المستخدم (مهمة)
- «ما أبي أي غلط ولا سؤال تافه، شغلنا احترافي». القواعد في `docs/QUESTION_RULES.md` (قسم أسئلة الصور).
- صورة السؤال ما فيها أي حرف أو شعار يدل على الجواب. شيك كل صورة بعينك قبل النشر.
- ردود المستخدم: عربي كويتي مختصر.
- الفرع: `claude/adoring-keller-4o3w9x`.
