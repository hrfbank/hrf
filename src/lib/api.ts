// مصدر البيانات: data/questions.json (المدقق فقط يظهر في الموقع)
import raw from "../../data/questions.json";
import { hash } from "./hash";
import { PAGE_SIZE, type Category, type LetterCount, type Question, type QuestionPage, type QuestionQuery } from "./types";

type RawQuestion = {
  id: number;
  category: string;
  question: string;
  answer: string;
  letter: string;
  difficulty: 1 | 2 | 3;
  status: "pending" | "verified" | "rejected";
  source: string | null;
};
type RawDb = {
  categories: { slug: string; name: string; description: string | null; sort_order: number }[];
  questions: RawQuestion[];
};

const db = raw as RawDb;
const idBySlug = new Map(db.categories.map((c) => [c.slug, c.sort_order]));

const questions: Question[] = db.questions
  .filter((q) => q.status === "verified")
  .map((q) => ({
    id: q.id,
    category_id: idBySlug.get(q.category)!,
    question: q.question,
    answer: q.answer,
    letter: q.letter,
    difficulty: q.difficulty,
    source: q.source,
  }));

const categories: Category[] = db.categories
  .map((c) => ({
    id: c.sort_order,
    slug: c.slug,
    name: c.name,
    description: c.description,
    icon: null,
    sort_order: c.sort_order,
    question_count: questions.filter((q) => q.category_id === c.sort_order).length,
  }))
  .sort((a, b) => a.sort_order - b.sort_order);

/** للبحث: يتجاهل التشكيل والهمزات */
const fold = (s: string) =>
  s.replace(/[ً-ٰٟـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");

export const api = {
  categories: async (): Promise<Category[]> => categories,

  letterCounts: async (): Promise<LetterCount[]> => {
    const map = new Map<string, LetterCount>();
    for (const q of questions) {
      const k = `${q.category_id}:${q.letter}`;
      const cur = map.get(k) ?? { category_id: q.category_id, letter: q.letter, question_count: 0 };
      cur.question_count++;
      map.set(k, cur);
    }
    return [...map.values()];
  },

  questions: async ({ categoryId, letter, search, page = 0 }: QuestionQuery): Promise<QuestionPage> => {
    const term = search ? fold(search.trim()) : "";
    const all = questions.filter(
      (q) =>
        (!categoryId || q.category_id === categoryId) &&
        (!letter || q.letter === letter) &&
        (!term || fold(q.question).includes(term) || fold(q.answer).includes(term)),
    );
    return { items: all.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), total: all.length };
  },

  dailyQuestion: async (dayKey: string): Promise<Question | null> =>
    questions.length ? questions[hash(dayKey) % questions.length] : null,
};
