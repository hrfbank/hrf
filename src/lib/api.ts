import { isDemo, supabase } from "./supabase";
import { demoApi } from "./demo";
import { hash } from "./hash";
import { PAGE_SIZE, type Category, type LetterCount, type Question, type QuestionPage, type QuestionQuery } from "./types";

const QUESTION_FIELDS = "id,category_id,question,answer,letter,difficulty";

function fail(error: { message: string } | null): never | void {
  if (error) throw new Error(error.message);
}

/** يحذف الرموز اللي تكسر فلتر PostgREST */
const cleanSearch = (s: string) => s.replace(/[%,()*\\]/g, " ").trim();

const liveApi = {
  async categories(): Promise<Category[]> {
    const { data, error } = await supabase!.from("category_stats").select("*").order("sort_order");
    fail(error);
    return (data ?? []).map((c) => ({ ...c, question_count: Number(c.question_count) }));
  },

  async letterCounts(): Promise<LetterCount[]> {
    const { data, error } = await supabase!.from("letter_stats").select("*");
    fail(error);
    return (data ?? []).map((r) => ({ ...r, question_count: Number(r.question_count) }));
  },

  async questions({ categoryId, letter, search, page = 0 }: QuestionQuery): Promise<QuestionPage> {
    let query = supabase!
      .from("questions")
      .select(QUESTION_FIELDS, { count: "exact" })
      .eq("status", "verified")
      .order("id")
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (letter) query = query.eq("letter", letter);
    const term = search ? cleanSearch(search) : "";
    if (term) query = query.or(`question.ilike.%${term}%,answer.ilike.%${term}%`);
    const { data, error, count } = await query;
    fail(error);
    return { items: (data ?? []) as Question[], total: count ?? 0 };
  },

  async dailyQuestion(dayKey: string): Promise<Question | null> {
    const { count, error } = await supabase!
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("status", "verified");
    fail(error);
    if (!count) return null;
    const offset = hash(dayKey) % count;
    const { data, error: e2 } = await supabase!
      .from("questions")
      .select(QUESTION_FIELDS)
      .eq("status", "verified")
      .order("id")
      .range(offset, offset);
    fail(e2);
    return (data?.[0] as Question) ?? null;
  },
};

export const api = isDemo ? demoApi : liveApi;
