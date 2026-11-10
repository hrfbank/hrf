// اختيار سؤال لخلية: عشوائي، موزّع بالتساوي على الفئات المختارة،
// وما يكرر على الحساب سؤال طلع له قبل (إلا لو خلصت كل الأسئلة الجديدة،
// فيرجع للأقدم مشاهدة). كل حساب له سجله، والسؤال عادي يطلع لحساب ثاني.
//
// السجل ينحفظ على الجهاز لكل حساب (hrf-seen:<id>)، ولما يكون فيه
// تسجيل دخول ينحفظ كمان في Supabase (جدول seen_questions) عشان يتبع
// الحساب على أي جهاز.
import type { Question } from "../lib/types";
import { supabase } from "../lib/auth";

const SEEN_MAX = 5000;
type Seen = Map<number, number>; // رقم السؤال ← وقت ظهوره

let account = "guest";
let cache: Seen | null = null;

const keyFor = (acc: string) => `hrf-seen:${acc}`;

function readLocal(acc: string): Seen {
  try {
    const raw = JSON.parse(localStorage.getItem(keyFor(acc)) ?? "[]") as [number, number][];
    return new Map(raw);
  } catch {
    return new Map();
  }
}

function writeLocal() {
  if (!cache) return;
  try {
    const list = [...cache.entries()].sort((a, b) => a[1] - b[1]).slice(-SEEN_MAX);
    localStorage.setItem(keyFor(account), JSON.stringify(list));
  } catch {
    /* التخزين غير متاح */
  }
}

/** يحدد الحساب الحالي (أو الضيف) ويجيب سجله من Supabase ويدمجه مع الجهاز. */
export async function setSeenAccount(userId: string | null) {
  account = userId ?? "guest";
  cache = readLocal(account);
  if (!userId || !supabase) return;
  const { data, error } = await supabase.from("seen_questions").select("question_id, seen_at").eq("user_id", userId).limit(SEEN_MAX);
  if (error || !data) return;
  for (const r of data) {
    const t = Date.parse(r.seen_at as string);
    cache.set(r.question_id as number, Math.max(cache.get(r.question_id as number) ?? 0, t));
  }
  writeLocal();
}

export function loadSeen(): Seen {
  if (!cache) cache = readLocal(account);
  return cache;
}

export function markSeen(id: number) {
  const seen = loadSeen();
  const now = Date.now();
  seen.set(id, now);
  writeLocal();
  if (account !== "guest" && supabase) {
    void supabase.from("seen_questions").upsert({ user_id: account, question_id: id, seen_at: new Date(now).toISOString() });
  }
}

const randomOf = <T,>(arr: T[], rand = Math.random) => arr[Math.floor(rand() * arr.length)];

/**
 * candidates: أسئلة الحرف المتاحة. usedInMatch: الأسئلة اللي طلعت في المباراة الحالية.
 * 1) لو فيه أسئلة ما شافها الحساب، نختار منها بس.
 * 2) نختار الفئة الأقل استخداماً في المباراة (والتعادل بالقرعة)، عشان كل الفئات تاخذ نصيبها.
 * 3) داخل الفئة سؤال عشوائي. ولو كل الأسئلة انشافت، ناخذ الأقدم مشاهدة.
 */
export function chooseQuestion(
  candidates: Question[],
  usedInMatch: Question[],
  seen: Seen,
  rand = Math.random,
): Question | null {
  if (!candidates.length) return null;
  const fresh = candidates.filter((q) => !seen.has(q.id));
  if (!fresh.length) {
    const oldest = Math.min(...candidates.map((q) => seen.get(q.id)!));
    return randomOf(candidates.filter((q) => seen.get(q.id) === oldest), rand);
  }

  const catUse = new Map<number, number>();
  for (const q of usedInMatch) catUse.set(q.category_id, (catUse.get(q.category_id) ?? 0) + 1);
  const byCat = new Map<number, Question[]>();
  for (const q of fresh) byCat.set(q.category_id, [...(byCat.get(q.category_id) ?? []), q]);

  const cats = [...byCat.keys()];
  const minUse = Math.min(...cats.map((c) => catUse.get(c) ?? 0));
  const cat = randomOf(cats.filter((c) => (catUse.get(c) ?? 0) === minUse), rand);
  return randomOf(byCat.get(cat)!, rand);
}
