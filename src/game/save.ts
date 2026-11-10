// حفظ المباراة الجارية على هذا الجهاز، عشان تكمّلونها لو انقفلت الصفحة.
// (الحفظ على الحساب يجي مع Supabase.)
const KEY = "hrf-game";

export function saveGame<T>(state: T) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
  } catch {
    /* التخزين غير متاح */
  }
}

export function loadGame<T>(): (T & { savedAt: number }) | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* التخزين غير متاح */
  }
}

export const hasSavedGame = () => {
  const g = loadGame<{ phase: string }>();
  return !!g && g.phase !== "setup" && g.phase !== "matchWon";
};
