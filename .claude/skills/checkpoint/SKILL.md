---
name: checkpoint
description: Use after every completed step, before any risky change, and when the user says "احفظ" or "checkpoint". Commits and pushes work so nothing is lost if the session ends.
---

# حفظ الشغل (Checkpoint)

## متى
- بعد كل خطوة تشتغل (البناء ينجح).
- قبل أي تعديل كبير أو خطير (حذف، refactor، تغيير هيكل بيانات).
- كل 20-30 دقيقة شغل تقريباً حتى لو المهمة ما خلصت.
- لما يقول المستخدم "احفظ".

## الخطوات
1. `git status --short` لتشوف وش تغيّر.
2. تأكد ما فيه ملفات ما لازم تنحفظ (`.env`، ملفات مؤقتة). إذا فيه، أضفها لـ `.gitignore`.
3. إذا البناء ينجح:
   `git add -A && git commit -m "feat|fix|refactor: وصف قصير"`
4. إذا الشغل ناقص أو البناء مكسور، احفظه برضو بعلامة واضحة:
   `git add -A && git commit -m "wip: وش انعمل ووش باقي"`
5. ادفع للريبو: `git push` (إذا ما فيه upstream: `git push -u origin HEAD`).
6. أكّد للمستخدم في سطر واحد: ✅ انحفظ + اسم الـ commit.

## ممنوع
- لا `git push --force`.
- لا تعمل commit لأسرار أو مفاتيح.
- لا تعمل `git reset --hard` أو `git checkout .` بدون موافقة صريحة.
