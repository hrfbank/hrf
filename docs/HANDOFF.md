# HANDOFF — 2026-11-28 (جلسة ٢)

## المهمة الحالية
«حروف»: أسئلة صور بمعيار لقطات صاحب اللعبة (`docs/QUESTION_RULES.md` القسم ١٣، اقرأه أول). الموقع: https://claude.ai/artifact/ATCSxDzGuVWas9EgaxqXSS (`npm run build && npm run artifact` ثم Artifact publish مع url وملفات الصور الجديدة من dist/images).
الفرع: `claude/amazing-dijkstra-ix594s` (مبني على `claude/stoic-ptolemy-rnoxy2`).

## أول شي
1. `echo ${HRF_CONTACT:+ok} ${GOOGLE_MAPS_KEY:+ok} ${TMDB_KEY:+ok}` (لا تطبع القيم).
2. `npm install && npm run validate`.
3. Python: `python3 -m venv /tmp/imgvenv && /tmp/imgvenv/bin/pip install mediapipe pillow opencv-python-headless scipy pytesseract` + `apt-get install -y libegl1 libgles2 libgl1 tesseract-ocr tesseract-ocr-ara`.
4. قرارات المراجعة: اقرأ مجموعة `image_review` من مخزن الصفحة (ArtifactData) وطبّقها بـ `node tools/images/apply-review.mjs`.

## الأدوات (tools/images)
- `build.py <key>`: ما يلمس سؤال معتمد أو مرفوض ولا صوره.
- `cars.py` (kind `car`): masks = inpainting، و `[x,y,w,h,"#لون" أو "auto"]` = لون واحد. يدعم `url` لصورة من خارج Commons.
- `photos.py` (celeb): TMDB أول (يتحقق من مكان الميلاد)، `tmdb:الاسم` بدون ويكي بيانات. `HRF_TMDB_ONLY=1`، `HRF_NEW_ONLY=1`.
- `gmaps.py` (kind `location`، set `loc` فيه ٣١ مكان): خريطة قوقل مرتين (بأسماء وبدون) ومسح اسم المكان + دبوس. `build_ocr` يمسح كل اسم فيه الجواب.
- ويكيميديا تبطّئ وايد (429): `HRF_RATE=6`، مقاس ١٢٨٠ بس.

## المستوى المعتمد (اقرأ قبل أي سيارة)
`docs/QUESTION_RULES.md` القسم ١٥: صور صحفية رسمية، موديلات حديثة، إخفاء نظيف. مثال الإعداد في sets.json (`prado-silhouette`، `hilux-2026`، `lexus-lx-rear`): `url` + `credit` + `license` + `source`. ملاحظة: نفس الجواب ما يتكرر في سؤالي صور بنفس الفئة (المدقق يرفض)، فاختر موديلات جديدة غير اللي معتمدة.

## جديد 2026-11-28
- **صورة الجواب للأسئلة النصية:** `image.mode = "answer"` تطلع بس مع الجواب. `tools/images/answer_images.py [ids]` يجيبها من TMDB للفئات في TARGETS (ممثلون، مسلسلات، مسرحيات، أغاني). شيك كل صورة بالعين: TMDB أحياناً يجيب شخص أو عمل بنفس الاسم (حصل مع «شيرين» و«أم البنات»).
- **فئة «أغاني» (songs):** «من صاحب هذه الأغاني...؟». الأفكار الباقية من سين جيم: «أكمل الكلمات الناقصة» و«اسم الألبوم».
- **الدفعات النصية:** `python3 scripts/add-batch.py دفعة.json` (كل سؤال مدقق بمصدر قبل).

## جديد (جلسة ٢)
- **تحقق المصادر بسرعة:** ويكيبيديا ترد 429 لو طلبت صفحة صفحة. اطلب مقدمات ٢٠ صفحة بطلب واحد (`action=query&prop=extracts&exintro&titles=a|b|...`). أداة الجلسة كانت في الـscratchpad (`wv2.py`)، الفكرة بسيطة وتنكتب من جديد.
- **صور كومنز:** اطلب المقاس ٩٦٠ (المقاسات غير القياسية تنحجب 429). `tools/images/commons_answer.py رقم="اسم ملف"` يحفظ صورة الجواب ويحدّث البنك لكل صورة. أسماء الملفات: `prop=pageimages&pilicense=free` على ar.wikipedia (٢٠ صفحة بطلب).
- **TMDB يغلط بالأسماء:** «Elissa» طلع شخص ثاني، و«حماقي» صورة مو له. شيك كل صورة بالعين.
- **سيارات رسمية:** أرشيف تويوتا `global.toyota/pages/history/vehicles/<crown|corolla|camry>/v_<m>_NNN.jpg` (كل الأجيال، دقة عالية)، ولاند روفر `media.jaguarlandrover.com/image-packs/...` (روابط media.production.jlrms.com). نيسان الصحفي يبي تسجيل دخول للدقة العالية.
- **cars.py:** `["clone", dx, dy]` لشبك مايل، `"vclone"` لشبك عمودي، المسح صار يضيف حبيبات بنفس خشونة السطح، و `HRF_ITEMS=id1,id2` يبني عناصر محددة بس.
- **رُفض بعيني قبل النشر:** ظل الديفندر (الأرض اندمجت معه)، كراون ١٩٧٩ (شعار الشبك ما ينمسح بدون أثر).
- **«أكمل الكلمات الناقصة» للأغاني ما انسوت:** تحتاج نقل كلمات أغاني محفوظة الحقوق. البديل اللي انسوى: «اسم الألبوم» و«من صاحب الأغنية».

## الباقي (بالترتيب)
1. **اللوكيشن:** Places API (New) لسا يرجع 403 ACCESS_DENIED (٢٠٢٦-١١-٢٨ جلسة ٢)، والـGeocoding API مو مفعّل بالمشروع. اطلب من صاحب اللعبة يتأكد إن المفتاح اللي عدّله هو نفسه (آخر ٤ حروف) أو "Don't restrict key". بعدها: `build.py loc` وشيك كل خريطة بعينك (الدبوس على المكان، ولا اسم يكشف الجواب).
2. **مشاهير ناقصين** (TMDB ما عنده صور كبيرة): ابحث مصدر ثاني أو صور من صاحب اللعبة.
3. **منتجات:** تحتاج صور استوديو بخلفية بيضاء (مواقع متاجر)، السؤال «ما هي شركة هذا المنتج؟» (ينشال اسم الشركة) و«ما هو المنتج؟» (ينشال اسم المنتج). صور Open Food Facts ما نفعت.
4. الكويت، سياحة وسفر، شعارات إضافية (من HANDOFF القديم).

## قواعد صاحب اللعبة
- «ما أبي أي غلط ولا سؤال تافه، شغلنا احترافي». كل صورة سؤال تنشاف بالعين قبل الحفظ.
- ردود: عربي كويتي مختصر.
