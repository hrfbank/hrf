#!/usr/bin/env node
// يتأكد إن كل عنصر في tools/images/sets.json له سؤال في البنك وملفات صوره موجودة
import { readFileSync, existsSync } from "node:fs";
const sets = JSON.parse(readFileSync(new URL("../tools/images/sets.json", import.meta.url))).sets;
const db = JSON.parse(readFileSync(new URL("../data/questions.json", import.meta.url)));
const keys = new Set(db.questions.map((q) => q.image?.key).filter(Boolean));
const answers = new Set(db.questions.filter((q) => q.image).map((q) => `${q.image.key?.split(":")[0]}|${q.answer}`));
// المشاهير: لو ما لقينا لهم صورة تصلح، يطلعون تنبيه مو خطأ (المولّد يرفضهم عن قصد)
const OPTIONAL = new Set(["celeb"]);
let missing = 0, files = 0, skipped = 0;
for (const s of sets) for (const p of s.picks ?? []) {
  const k = `${s.key}:${p[0]}`;
  const name = String(p[0]).replace(/^جزيرة /, "");
  if (keys.has(k) || answers.has(`${s.key}|${name}`) || answers.has(`${s.key}|${p[1]}`)) continue;
  if (OPTIONAL.has(s.key)) { skipped++; continue; }
  console.log(`❌ ناقص في البنك: ${k} (${p[1]})`); missing++;
}
if (skipped) console.log(`⚠️ ${skipped} مشهور ما لقينا له صورة تصلح (مو خطأ)`);
for (const q of db.questions) for (const f of [q.image?.file, q.image?.question_file].filter(Boolean))
  if (!existsSync(new URL(`../public/${f}`, import.meta.url))) { console.log(`❌ صورة ناقصة: #${q.id} ${f}`); files++; }
console.log(missing + files ? `${missing} سؤال ناقص، ${files} صورة ناقصة` : "✓ كل أسئلة الصور موجودة بصورها");
process.exit(missing + files ? 1 : 0);
