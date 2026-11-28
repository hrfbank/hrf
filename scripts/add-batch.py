#!/usr/bin/env python3
"""يضيف دفعة أسئلة نصية مدققة إلى data/questions.json.

الاستخدام: python3 scripts/add-batch.py دفعة.json
الملف: قائمة أسئلة، كل واحد فيه category, question, answer, difficulty, clues, source (و accepted اختياري).
كل سؤال لازم يكون انتحقق من مصدره قبل (QUESTION_RULES.md المعيار ١). بعدها: npm run validate
"""
import datetime
import json
import sys

DB = "data/questions.json"
ORDER = ["id", "category", "question", "clues", "answer", "accepted", "letter", "difficulty", "status", "source",
         "verified_at", "review_note"]


def letter(answer: str) -> str:
    w = answer.split()[0]
    if w.startswith("ال") and len(w) > 3:
        w = w[2:]
    return {"أ": "ا", "إ": "ا", "آ": "ا"}.get(w[0], w[0])


def main():
    batch = json.load(open(sys.argv[1], encoding="utf-8"))
    db = json.load(open(DB, encoding="utf-8"))
    # نفس الجواب في فئة ثانية مسموح (مثلاً المطرب في «من هو المشهور» وفي «أغاني»)
    taken = {(q["category"], q["answer"]) for q in db["questions"] if q["status"] != "rejected"}
    nid = max(q["id"] for q in db["questions"]) + 1
    today = datetime.date.today().isoformat()
    added = []
    for q in batch:
        if (q["category"], q["answer"]) in taken:
            print(f"مكرر (ما انضاف): {q['answer']}")
            continue
        q = {**q, "id": nid, "letter": letter(q["answer"]), "status": "verified", "verified_at": today,
             "review_note": None}
        db["questions"].append({k: q[k] for k in ORDER if k in q})
        taken.add((q["category"], q["answer"]))
        added.append(q["answer"])
        nid += 1
    open(DB, "w", encoding="utf-8").write(json.dumps(db, ensure_ascii=False, indent=1) + "\n")
    print(f"انضاف {len(added)}: {'، '.join(added)}")


if __name__ == "__main__":
    main()
