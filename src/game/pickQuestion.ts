// اختيار سؤال لخلية: عشوائي، موزّع بالتساوي على الفئات المختارة،
// والسؤال اللي طلع للحساب ما يرجع له نهائياً (لا في جولة ولا في لعبة ثانية).
// كل حساب له سجله، والسؤال عادي يطلع لحساب ثاني.
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

/** عدد الأسئلة اللي طلعت للحساب الحالي. */
export const seenCount = () => loadSeen().size;

/** يمسح سجل الحساب الحالي (على الجهاز وفي Supabase)، فترجع كل الأسئلة جديدة له. */
export async function clearSeen() {
  cache = new Map();
  writeLocal();
  if (account !== "guest" && supabase) await supabase.from("seen_questions").delete().eq("user_id", account);
}

const randomOf = <T,>(arr: T[], rand = Math.random) => arr[Math.floor(rand() * arr.length)];

/**
 * candidates: أسئلة الحرف المتاحة. usedInMatch: الأسئلة اللي طلعت في المباراة الحالية.
 * 1) نستبعد كل سؤال شافه الحساب. لو ما بقى شي نرجع null (ما نكرر أبداً).
 * 2) نختار الفئة الأقل استخداماً في المباراة (والتعادل بالقرعة)، عشان كل الفئات تاخذ نصيبها.
 * 3) داخل الفئة سؤال عشوائي.
 */
export function chooseQuestion(
  candidates: Question[],
  usedInMatch: Question[],
  seen: Seen,
  rand = Math.random,
): Question | null {
  const fresh = candidates.filter((q) => !seen.has(q.id));
  if (!fresh.length) return null;

  const catUse = new Map<number, number>();
  for (const q of usedInMatch) catUse.set(q.category_id, (catUse.get(q.category_id) ?? 0) + 1);
  const byCat = new Map<number, Question[]>();
  for (const q of fresh) byCat.set(q.category_id, [...(byCat.get(q.category_id) ?? []), q]);

  const cats = [...byCat.keys()];
  const minUse = Math.min(...cats.map((c) => catUse.get(c) ?? 0));
  const cat = randomOf(cats.filter((c) => (catUse.get(c) ?? 0) === minUse), rand);
  return randomOf(byCat.get(cat)!, rand);
}
