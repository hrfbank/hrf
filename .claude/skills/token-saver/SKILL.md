---
name: token-saver
description: Always apply during any coding session to keep token use low. Search before reading, read only needed line ranges, never re-read files, and keep replies short.
---

# توفير التوكنز

## القراءة
1. **ابحث قبل ما تقرأ:** استخدم Grep أو Glob لتحديد الملف والسطر، ثم اقرأ النطاق المطلوب فقط (offset و limit).
2. **لا تقرأ ملف كامل** إذا كان أطول من 300 سطر. اقرأ الجزء المتعلق بالمهمة.
3. **لا تعيد قراءة ملف** قرأته أو عدّلته في نفس الجلسة.
4. **لا تقرأ أبداً:** `node_modules/`، `dist/`، `build/`، `package-lock.json`، ملفات البيانات الكبيرة (JSON/CSV فوق 500 سطر). إذا احتجت منها شي، استخدم `head` أو `jq` أو Grep.
5. **لا تستكشف المشروع كله.** ابدأ من `docs/HANDOFF.md` و `docs/PROGRESS.md` إذا كانت موجودة.

## الأوامر
6. قلّل مخرجات الأوامر: `| tail -30`، `--silent`، `-q`، `--reporter=dot`.
7. في الاختبارات شغّل الملف المتعلق فقط، مو كل الاختبارات، إلا في النهاية.
8. `git log --oneline -10` بدل `git log` الكامل، و `git diff --stat` قبل `git diff`.

## التعديل
9. استخدم Edit لتعديل جزء، لا تعيد كتابة الملف كامل بـ Write.
10. لا تعيد طباعة الكود اللي كتبته في الملف داخل ردّك.

## الردود
11. ردود قصيرة: وش انعمل في سطر أو سطرين. بدون شرح الخطوات، بدون تكرار.
12. لا تشرح الكود إلا إذا انطلب.

## الجلسة
13. إذا طالت الجلسة أو تغيّرت المهمة، اقترح على المستخدم `/compact` أو استخدم سكيل `handoff` ثم `/clear`.
