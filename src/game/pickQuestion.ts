// اختيار سؤال لخلية: عشوائي، موزّع بالتساوي على الفئات المختارة،
// ويفضّل الأسئلة اللي ما طلعت في مباريات سابقة على هذا الجهاز.
import type { Question } from "../lib/types";

const SEEN_KEY = "hrf-seen";
const SEEN_MAX = 3000;

export function loadSeen(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function markSeen(id: number) {
  try {
    const list = [...loadSeen()].filter((x) => x !== id);
    list.push(id);
    localStorage.setItem(SEEN_KEY, JSON.stringify(list.slice(-SEEN_MAX)));
  } catch {
    /* التخزين غير متاح */
  }
}

const randomOf = <T,>(arr: T[], rand = Math.random) => arr[Math.floor(rand() * arr.length)];

/**
 * candidates: أسئلة الحرف المتاحة. usedInMatch: الأسئلة اللي طلعت في المباراة الحالية.
 * 1) نختار الفئة الأقل استخداماً في المباراة (والتعادل بالقرعة)، عشان كل الفئات تاخذ نصيبها.
 * 2) داخل الفئة نفضّل سؤال ما انشاف قبل، ثم نختار عشوائياً.
 */
export function chooseQuestion(
  candidates: Question[],
  usedInMatch: Question[],
  seen: Set<number>,
  rand = Math.random,
): Question | null {
  if (!candidates.length) return null;
  const catUse = new Map<number, number>();
  for (const q of usedInMatch) catUse.set(q.category_id, (catUse.get(q.category_id) ?? 0) + 1);

  const byCat = new Map<number, Question[]>();
  for (const q of candidates) byCat.set(q.category_id, [...(byCat.get(q.category_id) ?? []), q]);

  // الفئات اللي فيها أسئلة جديدة تتقدّم على اللي كل أسئلتها انشافت
  const cats = [...byCat.keys()];
  const hasFresh = (c: number) => byCat.get(c)!.some((q) => !seen.has(q.id));
  const freshCats = cats.filter(hasFresh);
  const pool = freshCats.length ? freshCats : cats;
  const minUse = Math.min(...pool.map((c) => catUse.get(c) ?? 0));
  const cat = randomOf(pool.filter((c) => (catUse.get(c) ?? 0) === minUse), rand);

  const inCat = byCat.get(cat)!;
  const fresh = inCat.filter((q) => !seen.has(q.id));
  return randomOf(fresh.length ? fresh : inCat, rand);
}
