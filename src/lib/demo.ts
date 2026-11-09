// بيانات تجريبية للتطوير فقط (VITE_DEMO=1 أو بدون مفاتيح Supabase).
// لا تُستخدم في النسخة المنشورة. الأجوبة مختارة بحيث لا تبدأ بـ "ال".
import { hash } from "./hash";
import { PAGE_SIZE, type Category, type LetterCount, type Question, type QuestionPage, type QuestionQuery } from "./types";

const categories: Omit<Category, "question_count">[] = [
  { id: 1, slug: "general", name: "معلومات عامة", description: "أسئلة ثقافية متنوعة", icon: null, sort_order: 1 },
  { id: 2, slug: "kuwait", name: "الكويت", description: "تاريخ الكويت وجغرافيتها ومعالمها", icon: null, sort_order: 2 },
  { id: 3, slug: "islamic-history", name: "التاريخ الإسلامي", description: "أحداث وشخصيات من التاريخ الإسلامي", icon: null, sort_order: 3 },
  { id: 4, slug: "science", name: "العلوم", description: "فيزياء وكيمياء وأحياء وفلك", icon: null, sort_order: 4 },
  { id: 5, slug: "geography", name: "الجغرافيا", description: "دول وعواصم وتضاريس", icon: null, sort_order: 5 },
];

type Row = [number, string, string, string, 1 | 2 | 3];
const rows: Row[] = [
  [1, "ما الحيوان الملقّب بسفينة الصحراء؟", "جمل", "ج", 1],
  [1, "ما اسم الجهاز الذي يقيس الضغط الجوي؟", "بارومتر", "ب", 2],
  [1, "كم عدد أيام السنة الكبيسة؟", "ثلاثمئة وستة وستون يوماً", "ث", 1],
  [1, "ما لون حجر الزمرد؟", "أخضر", "ا", 1],
  [2, "ما عملة دولة الكويت؟", "دينار كويتي", "د", 1],
  [2, "ما أكبر جزر الكويت مساحةً؟", "بوبيان", "ب", 2],
  [2, "ما الجزيرة الكويتية التي عُثر فيها على آثار يونانية من عهد الإسكندر؟", "فيلكا", "ف", 2],
  [2, "ما اسم عاصمة دولة الكويت؟", "مدينة الكويت", "م", 1],
  [3, "من أول الخلفاء الراشدين؟", "أبو بكر الصديق", "ا", 1],
  [3, "ما الاسم القديم للمدينة المنورة قبل الهجرة؟", "يثرب", "ي", 1],
  [3, "من الصحابي الملقّب بسيف الله المسلول؟", "خالد بن الوليد", "خ", 1],
  [3, "من القائد الذي عبر إلى الأندلس سنة ٩٢ هـ؟", "طارق بن زياد", "ط", 2],
  [3, "ما المدينة التي بناها أبو جعفر المنصور عاصمةً للدولة العباسية؟", "بغداد", "ب", 2],
  [4, "ما أقرب كواكب المجموعة الشمسية إلى الشمس؟", "عطارد", "ع", 1],
  [4, "ما الغاز الذي تمتصه النباتات في عملية البناء الضوئي؟", "ثاني أكسيد الكربون", "ث", 1],
  [4, "كم عدد عظام جسم الإنسان البالغ؟", "مئتان وست عظمات", "م", 2],
  [4, "ما وحدة قياس شدة التيار الكهربائي؟", "أمبير", "ا", 2],
  [4, "من العالِم الذي صاغ قوانين الحركة الثلاثة؟", "نيوتن", "ن", 1],
  [5, "ما عاصمة اليابان؟", "طوكيو", "ط", 1],
  [5, "ما أعلى قمة جبلية في العالم؟", "إيفرست", "ا", 1],
  [5, "ما عاصمة سلطنة عُمان؟", "مسقط", "م", 1],
  [5, "ما الدولة التي تشبه خريطتها شكل الحذاء؟", "إيطاليا", "ا", 1],
  [5, "ما عاصمة تركيا؟", "أنقرة", "ا", 2],
];

const questions: Question[] = rows.map(([category_id, question, answer, letter, difficulty], i) => ({
  id: i + 1, category_id, question, answer, letter, difficulty,
}));

const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 250));

export const demoApi = {
  categories: () =>
    delay(categories.map((c) => ({ ...c, question_count: questions.filter((q) => q.category_id === c.id).length }))),

  letterCounts: () => {
    const map = new Map<string, LetterCount>();
    for (const q of questions) {
      const k = `${q.category_id}:${q.letter}`;
      const cur = map.get(k) ?? { category_id: q.category_id, letter: q.letter, question_count: 0 };
      cur.question_count++;
      map.set(k, cur);
    }
    return delay([...map.values()]);
  },

  questions: ({ categoryId, letter, search, page = 0 }: QuestionQuery): Promise<QuestionPage> => {
    const term = search?.trim();
    const all = questions.filter(
      (q) =>
        (!categoryId || q.category_id === categoryId) &&
        (!letter || q.letter === letter) &&
        (!term || q.question.includes(term) || q.answer.includes(term)),
    );
    return delay({ items: all.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), total: all.length });
  },

  dailyQuestion: (dayKey: string) => delay(questions[hash(dayKey) % questions.length] ?? null),
};
