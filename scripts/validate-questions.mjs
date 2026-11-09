#!/usr/bin/env node
// فاحص قاعدة أسئلة حروف حسب docs/QUESTION_RULES.md
// الاستخدام:
//   npm run validate                 فحص كامل + إحصائيات
//   npm run validate -- --list kuwait   عرض أسئلة مجال (قبل إضافة أسئلة جديدة)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FILE = fileURLToPath(new URL("../data/questions.json", import.meta.url));
const LETTERS = [..."ابتثجحخدذرزسشصضطظعغفقكلمنهوي"];
const STATUSES = ["pending", "verified", "rejected"];

// ---------- تطبيع النص العربي ----------
export function normalize(s) {
  return s
    .replace(/[ً-ٰٟـ]/g, "") // تشكيل + تطويل
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^ء-يa-zA-Z0-9٠-٩\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** يحذف «ال» من أول كلمة لو بعدها حرفين على الأقل */
const stripAl = (word) => (word.startsWith("ال") && word.length > 3 ? word.slice(2) : word);

/** حرف السؤال: أول حرف من الإجابة بعد تجاهل «ال» (المعيار 4) */
export function letterOf(answer) {
  const first = normalize(answer).split(" ")[0] ?? "";
  return stripAl(first).charAt(0);
}

// ---------- الإجابات الممنوعة (المعيار 6) ----------
const NUMBER_WORDS = [
  "صفر", "واحد", "واحده", "اثنان", "اثنين", "اثنتان", "ثلاث", "ثلاثه", "اربع", "اربعه", "خمس", "خمسه",
  "ست", "سته", "سبع", "سبعه", "ثمان", "ثماني", "ثمانيه", "تسع", "تسعه", "عشر", "عشره", "عشرون", "عشرين",
  "ثلاثون", "اربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون", "مئه", "مايه", "مئتان", "مئتين",
  "الف", "الفان", "الفين", "مليون", "مليار", "نصف", "ربع", "ثلث",
];
const MONTHS = [
  "يناير", "فبراير", "مارس", "ابريل", "مايو", "يونيو", "يوليو", "اغسطس", "سبتمبر", "اكتوبر", "نوفمبر", "ديسمبر",
];

function forbiddenAnswer(answer) {
  const n = normalize(answer);
  const words = n.split(" ").map(stripAl);
  if (/[0-9٠-٩]/.test(answer)) return "الإجابة فيها رقم";
  if (["نعم", "لا", "صح", "خطا", "صحيح", "خاطي"].includes(n)) return "إجابة نعم/لا";
  // عدد لو أغلب الكلمات أعداد (عشان «الربع الخالي» ما ينحسب عدد)
  const isNum = (w) => {
    const x = w.replace(/^و(?=\S{2,})/, "");
    return NUMBER_WORDS.includes(x) || /^(ثلاث|اربع|خمس|ست|سبع|ثمان|تسع)(مئه|مايه)$/.test(x);
  };
  if (words.filter(isNum).length * 2 > words.length) return "الإجابة عدد أو كمية";
  if (words.some((w) => MONTHS.includes(w)) || /(^| )(عام|سنه|قرن)( |$)/.test(n)) return "الإجابة تاريخ أو سنة";
  return null;
}

// ---------- التشابه (المعيار 5) ----------
function trigrams(s) {
  const t = ` ${normalize(s)} `;
  const out = new Set();
  for (let i = 0; i < t.length - 2; i++) out.add(t.slice(i, i + 3));
  return out;
}

function jaccard(a, b) {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
}

// ---------- الفحص ----------
function validate(db) {
  const errors = [];
  const warnings = [];
  const err = (q, msg) => errors.push(`#${q.id} ${msg}`);
  const warn = (q, msg) => warnings.push(`#${q.id} ${msg}`);

  const cats = new Set(db.categories.map((c) => c.slug));
  const ids = new Set();
  const live = db.questions.filter((q) => q.status !== "rejected");

  for (const q of db.questions) {
    if (ids.has(q.id)) err(q, "رقم مكرر");
    ids.add(q.id);
    if (!cats.has(q.category)) err(q, `مجال غير معروف: ${q.category}`);
    if (!STATUSES.includes(q.status)) err(q, `حالة غير صحيحة: ${q.status}`);
    if (q.status === "rejected") {
      if (!q.review_note) err(q, "مرفوض بدون سبب في review_note");
      continue;
    }
    if (![1, 2, 3].includes(q.difficulty)) err(q, "الصعوبة لازم ١ أو ٢ أو ٣");
    if (!q.question?.trim().endsWith("؟")) err(q, "السؤال لازم ينتهي بـ ؟");

    const words = normalize(q.answer).split(" ").filter(Boolean);
    if (words.length > 3) err(q, `الإجابة أطول من ٣ كلمات: «${q.answer}»`);
    else if (words.length === 3) warn(q, `إجابة من ٣ كلمات (مسموح عند الضرورة): «${q.answer}»`);

    const expected = letterOf(q.answer);
    if (!LETTERS.includes(expected)) err(q, `أول حرف «${expected}» مو حرف عربي`);
    if (q.letter !== expected) err(q, `الحرف «${q.letter}» والمفروض «${expected}» (من «${q.answer}»)`);

    const bad = forbiddenAnswer(q.answer);
    if (bad) err(q, `${bad}: «${q.answer}»`);

    const core = words.map(stripAl).filter((w) => w.length > 2);
    const qWords = new Set(normalize(q.question).split(" ").map(stripAl));
    if (core.length && core.every((w) => qWords.has(w))) err(q, `الإجابة مكشوفة داخل السؤال: «${q.answer}»`);

    // التلميحات المتدرجة (للعرض على شاشة اللعبة)
    if (q.clues !== undefined && !Array.isArray(q.clues)) err(q, "clues لازم تكون قائمة");
    const clues = Array.isArray(q.clues) ? q.clues : [];
    if (q.status === "verified" && (clues.length < 2 || clues.length > 3)) err(q, `لازم ٢ إلى ٣ تلميحات (الموجود ${clues.length})`);
    clues.forEach((c, i) => {
      if (typeof c !== "string" || !c.trim()) return err(q, `التلميح ${i + 1} فاضي`);
      const cWords = new Set(normalize(c).split(" ").map(stripAl));
      if (core.length && core.every((w) => cWords.has(w))) err(q, `التلميح ${i + 1} يكشف الإجابة: «${c}»`);
    });
    if (new Set(clues.map(normalize)).size !== clues.length) err(q, "تلميحات مكررة");

    if (q.status === "verified") {
      if (!/^https?:\/\//.test(q.source ?? "")) err(q, "مدقق بدون رابط مصدر");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(q.verified_at ?? "")) err(q, "مدقق بدون verified_at");
    } else if (!q.source) {
      warn(q, "بدون مصدر");
    }
  }

  // التكرار: نص مطابق، أو تشابه عالي، أو نفس الإجابة في نفس المجال
  const grams = live.map((q) => trigrams(q.question));
  for (let i = 0; i < live.length; i++) {
    for (let j = i + 1; j < live.length; j++) {
      const a = live[i], b = live[j];
      if (normalize(a.question) === normalize(b.question)) {
        errors.push(`#${a.id} و #${b.id} نفس السؤال`);
        continue;
      }
      const sim = jaccard(grams[i], grams[j]);
      const sameAnswer = normalize(a.answer) === normalize(b.answer);
      if (sameAnswer && sim > 0.35) errors.push(`#${a.id} و #${b.id} نفس الإجابة وصياغة متشابهة (تكرار معنوي محتمل)`);
      else if (sim > 0.6) warnings.push(`#${a.id} و #${b.id} أسئلة متشابهة جداً (${Math.round(sim * 100)}٪)`);
      else if (sameAnswer) warnings.push(`#${a.id} و #${b.id} نفس الإجابة «${a.answer}»: تأكد إن الفكرة مختلفة`);
    }
  }
  return { errors, warnings };
}

function stats(db) {
  const by = (key) => {
    const m = {};
    for (const q of db.questions) m[key(q)] = (m[key(q)] ?? 0) + 1;
    return m;
  };
  const verified = db.questions.filter((q) => q.status === "verified");
  const letters = new Set(verified.map((q) => q.letter));
  console.log("\nالحالة:", by((q) => q.status));
  console.log("المدقق حسب المجال:", Object.fromEntries(db.categories.map((c) => [c.slug, verified.filter((q) => q.category === c.slug).length])));
  console.log("المدقق حسب الصعوبة:", { سهل: 0, متوسط: 0, صعب: 0, ...Object.fromEntries(Object.entries(
    verified.reduce((m, q) => ((m[q.difficulty] = (m[q.difficulty] ?? 0) + 1), m), {}),
  ).map(([k, v]) => [["", "سهل", "متوسط", "صعب"][k], v])) });
  console.log(`الحروف المغطاة: ${letters.size}/٢٨ — الناقصة: ${LETTERS.filter((l) => !letters.has(l)).join(" ") || "لا شي"}`);

  // جاهزية كل فئة للعب: كم حرف فيه سؤال مدقق، وكم حرف فيه ٣ أو أكثر
  console.log("\nتغطية الحروف لكل فئة (الجولة تسحب من ٦ فئات يختارها الفريقان):");
  for (const c of db.categories) {
    const counts = {};
    for (const q of verified) if (q.category === c.slug) counts[q.letter] = (counts[q.letter] ?? 0) + 1;
    const covered = LETTERS.filter((l) => counts[l]).length;
    const deep = LETTERS.filter((l) => (counts[l] ?? 0) >= 3).length;
    const row = LETTERS.map((l) => (counts[l] ? (counts[l] >= 3 ? "█" : "▒") : "·")).join("");
    console.log(`  ${c.name.padEnd(14)} ${row}  ${covered}/٢٨ حرف، ${deep} بعمق ٣+`);
  }
  console.log(`  ${"".padEnd(14)} ${LETTERS.join("")}   (█ ٣+  ▒ ١-٢  · لا شي)`);
}

// ---------- التشغيل ----------
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = JSON.parse(readFileSync(FILE, "utf8"));
  const listIdx = process.argv.indexOf("--list");
  if (listIdx > -1) {
    const cat = process.argv[listIdx + 1];
    for (const q of db.questions.filter((q) => !cat || q.category === cat))
      console.log(`#${q.id} [${q.status}] (${q.letter}) ${q.question} ← ${q.answer}`);
    process.exit(0);
  }
  const { errors, warnings } = validate(db);
  warnings.forEach((w) => console.log("⚠️ ", w));
  errors.forEach((e) => console.log("❌", e));
  stats(db);
  console.log(`\n${errors.length} خطأ، ${warnings.length} تحذير، ${db.questions.length} سؤال.`);
  process.exit(errors.length ? 1 : 0);
}
