#!/usr/bin/env node
// يطبّق قرارات صفحة «مراجعة أسئلة الصور» على data/questions.json
// الاستخدام: node tools/images/apply-review.mjs قرارات.json
// الملف: { "<id>": { "decision": "approve" | "reject", "difficulty": 1-3, "note"?: "..." } }
// (Claude يسحب القرارات من مخزن الصفحة ويحفظها في هالملف)
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../../data/questions.json", import.meta.url);
const db = JSON.parse(readFileSync(file, "utf8"));
const decisions = JSON.parse(readFileSync(process.argv[2], "utf8"));
const today = new Date().toISOString().slice(0, 10);
let approved = 0, rejected = 0, skipped = 0;
for (const [id, d] of Object.entries(decisions)) {
  const q = db.questions.find((x) => x.id === Number(id));
  if (!q || q.status !== "pending" || !q.image) { skipped++; continue; }
  if ([1, 2, 3].includes(d.difficulty)) q.difficulty = d.difficulty;
  if (d.decision === "approve") {
    q.status = "verified";
    q.verified_at = today;
    q.review_note = d.note ? `ملاحظة المراجعة: ${d.note}` : null;
    approved++;
  } else if (d.decision === "reject") {
    q.status = "rejected";
    q.review_note = `رفضه صاحب اللعبة${d.note ? `: ${d.note}` : ""}`;
    rejected++;
  }
}
writeFileSync(file, JSON.stringify(db, null, 1) + "\n");
console.log(`اعتُمد ${approved}، رُفض ${rejected}، تُجوهل ${skipped}`);
