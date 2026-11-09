---
name: huroof-questions
description: Use whenever writing, adding, editing, reviewing or importing questions for the Huroof question bank (data/questions.json), or when the user says "أسئلة" / "ولّد أسئلة" / "راجع الأسئلة". Enforces docs/QUESTION_RULES.md.
---

# إضافة ومراجعة أسئلة حروف

المرجع الإلزامي: `docs/QUESTION_RULES.md`. الجودة أهم من العدد.

## الخطوات
1. اقرأ `docs/QUESTION_RULES.md` (لو ما انقرأ في الجلسة).
2. قبل الكتابة: `npm run validate -- --list <category>` لتشوف الموجود في المجال وتتجنب التكرار المعنوي.
3. اكتب الأسئلة في `data/questions.json` بحالة `pending`، مع `clues` (٢ إلى ٣ تلميحات متدرجة من العام للخاص)، وكل سؤال له `source` (رابط مصدر موثوق محدد، مو موقع عام).
4. تحقق من كل سؤال **وكل تلميح** بالمصدر فعلياً (WebFetch / WebSearch). لا تعتمد على الذاكرة وحدها.
   - تأكدت ← `status: "verified"` و `verified_at` بتاريخ اليوم.
   - المعلومة مشكوك فيها أو ما لقيت مصدر ← يبقى `pending` أو `rejected` مع `review_note`.
5. `npm run validate` لازم يطلع بدون أخطاء. التحذيرات راجعها واحد واحد.
6. حدّث العدد في `docs/PROGRESS.md` واحفظ (checkpoint).

## ممنوع
- إجابة رقم أو سنة أو تاريخ أو نعم/لا.
- تغيير حقيقة عشان تطابق حرف.
- `verified` بدون مصدر تم فتحه فعلاً.
- أسئلة سطحية جداً (مثل عاصمة دولة مشهورة جداً) إلا في مستوى سهل وبعدد قليل.
