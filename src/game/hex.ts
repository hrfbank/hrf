// منطق لوحة حروف: خلايا سداسية بإزاحة الصفوف الفردية (odd-r).
// الصف الفردي مزاح نصف خلية لليمين بصرياً، والتجاور يتبع هذا الترتيب بالضبط.

export type Team = "red" | "green";
export type Cell = { r: number; c: number; letter: string; owner: Team | null };
export type Board = { rows: number; cols: number; cells: Cell[] };

export const at = (b: Board, r: number, c: number) => b.cells[r * b.cols + c];

/** الجيران الحقيقيون لخلية في شبكة odd-r */
export function neighbors(b: Board, r: number, c: number): Cell[] {
  const odd = r % 2 === 1;
  const deltas = odd
    ? [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]]
    : [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]];
  return deltas
    .map(([dr, dc]) => [r + dr, c + dc])
    .filter(([y, x]) => y >= 0 && y < b.rows && x >= 0 && x < b.cols)
    .map(([y, x]) => at(b, y, x));
}

/**
 * هل الفريق كوّن مساراً متصلاً بين ضلعيه؟
 * الأحمر: من العمود الأول إلى الأخير (يمين ↔ يسار). الأخضر: من الصف الأول إلى الأخير (أعلى ↔ أسفل).
 * يرجّع خلايا المسار الفائز (لإبرازها) أو null.
 */
export function winningPath(b: Board, team: Team): Cell[] | null {
  const horizontal = team === "red";
  const starts = b.cells.filter((x) => x.owner === team && (horizontal ? x.c === 0 : x.r === 0));
  const isEnd = (x: Cell) => (horizontal ? x.c === b.cols - 1 : x.r === b.rows - 1);
  const prev = new Map<Cell, Cell | null>();
  const queue: Cell[] = [];
  for (const s of starts) {
    prev.set(s, null);
    queue.push(s);
  }
  while (queue.length) {
    const cur = queue.shift()!;
    if (isEnd(cur)) {
      const path: Cell[] = [];
      for (let p: Cell | null = cur; p; p = prev.get(p) ?? null) path.push(p);
      return path;
    }
    for (const n of neighbors(b, cur.r, cur.c)) {
      if (n.owner === team && !prev.has(n)) {
        prev.set(n, cur);
        queue.push(n);
      }
    }
  }
  return null;
}

function shuffle<T>(arr: T[], rand = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * يبني لوحة من الحروف المتاحة. الحروف اللي فيها أسئلة أكثر لها أولوية،
 * ولو الحروف المتاحة أقل من عدد الخلايا تتكرر بعض الحروف.
 */
export function buildBoard(rows: number, cols: number, available: Record<string, number>, rand = Math.random): Board {
  const size = rows * cols;
  const letters = shuffle(Object.keys(available).filter((l) => available[l] > 0), rand);
  const chosen: string[] = letters.slice(0, size);
  // تكرار الحروف اللي عندها أسئلة كافية لو اللوحة ما امتلت
  const spare = letters.filter((l) => available[l] > 1);
  let i = 0;
  while (chosen.length < size && spare.length) {
    const l = spare[i % spare.length];
    const used = chosen.filter((x) => x === l).length;
    if (used < available[l]) chosen.push(l);
    i++;
    if (i > size * 4) break;
  }
  const final = shuffle(chosen, rand);
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ r, c, letter: final[r * cols + c] ?? "", owner: null });
  return { rows, cols, cells };
}
