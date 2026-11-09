---
name: handoff
description: Use when ending a session, when context is getting long, or when the user says "سلّم" or "handoff" or "بكمل بعدين". Writes docs/HANDOFF.md so the next session resumes without re-exploring the project.
---

# التسليم للجلسة الجاية

الهدف: الجلسة الجاية تقرأ ملف واحد قصير وتكمل مباشرة، بدون ما تستكشف المشروع من جديد (هذا أكبر توفير للتوكنز).

## الخطوات
1. اكتب أو استبدل `docs/HANDOFF.md` بهذا الشكل (أقل من 40 سطر):

```markdown
# HANDOFF — [التاريخ]

## المهمة الحالية
[سطر أو سطرين: وش نسوي وليش]

## وين وصلنا
- [x] خطوة خلصت
- [ ] الخطوة الجاية ← ابدأ من هنا

## الملفات المهمة
- `path/file.js` — [وش دوره] (السطور المهمة: 40-90)

## معلومات لازم تعرفها
- [قرار، مشكلة، أمر خاص، شي جرّبته وما نفع]

## أول أمر في الجلسة الجاية
[مثلاً: npm run dev ثم افتح صفحة كذا]
```

2. حدّث `docs/PROGRESS.md` باختصار (سكيل `update-log`).
3. احفظ واعمل push (سكيل `checkpoint`) برسالة `docs: handoff`.
4. قل للمستخدم: "جاهز. افتح جلسة جديدة أو اكتب /clear، وابدأ بـ: اقرأ docs/HANDOFF.md وكمّل".

## قواعد
- اكتب الحقائق فقط، لا تكتب شي ما صار.
- لا تنسخ كود داخل HANDOFF.md، اكتب مسار الملف والسطور بدلاً منه.
