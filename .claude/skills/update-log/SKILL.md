---
name: update-log
description: Use after finishing a task, or when the user says "سجّل" or "update log". Adds a short dated entry to docs/PROGRESS.md (what was done, what remains, open issues) and records any technical decision in docs/DECISIONS.md.
---

# تحديث السجل

الهدف: أي جلسة تقرأ `docs/PROGRESS.md` تعرف وش انعمل ووش باقي، و `docs/DECISIONS.md` تعرف ليش.

## الخطوات
1. اقرأ `docs/PROGRESS.md` (أنشئه لو مو موجود بعنوان `# PROGRESS`).
2. أضف تحت عنوان تاريخ اليوم `## YYYY-MM-DD` (الأحدث فوق). لو العنوان موجود أضف تحته:
   - وش انعمل (سطر لكل شي، مع مسار الملف)
   - وش باقي (لو فيه)
   - مشاكل معلّقة (لو فيه)
3. لو انتخذ قرار تقني أو تصميمي، أضفه في `docs/DECISIONS.md` بهذا الشكل:

```markdown
## YYYY-MM-DD — [القرار باختصار]
- **القرار:** ...
- **السبب:** ...
- **البدائل اللي انرفضت:** ... (لو فيه)
```

## قواعد
- الحقائق فقط: لا تسجّل شي ما صار، ولا تقول "تم الاختبار" إذا ما انشغّل.
- مختصر: سطر أو سطرين لكل بند، لا تنسخ كود.
- لا تحذف إدخالات قديمة.
