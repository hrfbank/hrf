export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  question_count: number;
};

export type Question = {
  id: number;
  category_id: number;
  question: string;
  answer: string;
  letter: string;
  difficulty: 1 | 2 | 3;
  source: string | null;
  clues: string[];
  image?: QuestionImage;
};

export type QuestionImage = { file: string; credit: string; license: string; source?: string; alt?: string };

export type LetterCount = { category_id: number; letter: string; question_count: number };

export type QuestionQuery = {
  categoryId?: number;
  letter?: string;
  search?: string;
  page?: number;
};

export type QuestionPage = { items: Question[]; total: number };

export const PAGE_SIZE = 20;
