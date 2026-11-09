import { createContext, useContext } from "react";
import type { Category, LetterCount } from "../lib/types";

export type Catalog = {
  categories: Category[];
  letterCounts: LetterCount[];
  loading: boolean;
  error: Error | null;
};

export const CatalogContext = createContext<Catalog>({ categories: [], letterCounts: [], loading: true, error: null });

export const useCatalog = () => useContext(CatalogContext);

/** مجموع الأسئلة لكل حرف، لمجال واحد أو لكل المجالات */
export function lettersFor(counts: LetterCount[], categoryId?: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of counts) {
    if (categoryId && c.category_id !== categoryId) continue;
    out[c.letter] = (out[c.letter] ?? 0) + c.question_count;
  }
  return out;
}
