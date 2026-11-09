// إعدادات لعبة حروف: كل القواعد في مكان واحد.
// أي تعديل على طريقة اللعب يبدأ من هنا (وسجّل القرار في docs/GAME_DESIGN.md).

export const GAME_CONFIG = {
  /** مهلة الإجابة بعد ضغط الجرس: الخيارات اللي تظهر للاعبين، والافتراضي */
  answerSeconds: { options: [10, 20, 30], default: 10 },

  /** التكتكة في آخر كم ثانية، ومتى تصير أحدّ */
  tickLastSeconds: 4,
  urgentLastSeconds: 2,

  /** اللوحة */
  board: { rows: 5, cols: 5 },

  /** المباراة: أول فريق يفوز بهذا العدد من الجولات */
  match: { roundsToWin: 3, maxRounds: 5 },

  /** اختيار الفئات قبل الجولة */
  categories: { total: 6, perTeam: 3, pickOrder: "alternate" as "alternate" | "free" },

  /** الجرس */
  buzzer: {
    /** عقوبة الضغط قبل فتح الجرس (ثواني) */
    earlyPressLockSeconds: 1,
  },

  /** الإجابة الخاطئة: السؤال ينتقل للفريق الثاني، ويُكشف له تلميح إضافي لو باقي */
  wrongAnswer: { passToOtherTeam: true, revealExtraClue: true },

  /** بعد «اكشف الجواب»: شاشة «أي فريق جاوب صح؟» */
  judging: { allowNone: true, undoLastAction: true },

  /** الفريقان */
  teams: {
    red: { name: "الأحمر", direction: "horizontal" as const },
    green: { name: "الأخضر", direction: "vertical" as const },
    /** كل فريق يكتب اسمه عند البداية (الاسم الافتراضي فوق) */
    customNames: { enabled: true, maxLength: 16 },
  },

  /** مساحة اختيارية لشعار راعٍ في شاشة اللوحة */
  sponsor: { enabled: false, name: "", logo: "" },

  /** مزايا إضافية: شغّل أو أطفئ أي واحدة */
  features: {
    /** خلايا مخفية سؤالها أصعب، والفائز بها ياخذ معها خلية مجاورة */
    goldenCells: { enabled: true, perBoard: 2 },
    /** تحدي خلية الخصم بسؤال أصعب */
    stealCell: { enabled: true, perRound: 1 },
    /** وسائل المساعدة: ٣ أنواع، كل نوع مرة واحدة لكل فريق في المباراة */
    helpers: {
      enabled: true,
      usesPerKindPerMatch: 1,
      kinds: [
        { id: "extraClue", name: "تلميح إضافي" },
        { id: "changeQuestion", name: "غيّر السؤال" },
        { id: "callFriend", name: "اتصال بصديق", seconds: 30 },
      ],
    },
    /** أسئلة الصور: تبدأ مقرّبة، وكل تلميح يبعّد الصورة خطوة */
    imageReveal: {
      enabled: true,
      /** كل تلميح يوسّع القصّة خطوة نحو الصورة الكاملة (false = تبقى مقصوصة لين الجواب) */
      progressive: true,
    },
    /** أسئلة الخرائط: لقطة خريطة بدون أسماء (تحتاج مصدر خرائط مرخّص) */
    mapQuestions: { enabled: true },
    /** بعد الفوز بالمباراة: لاعب واحد يكمل مساراً خلال وقت محدد */
    finalRound: { enabled: true, seconds: 60 },
  },

  /** الصوت الافتراضي (اللاعب يقدر يغيّره) */
  sound: { music: 0.35, sfx: 0.8, musicBpm: 104 },
} as const;

export type GameConfig = typeof GAME_CONFIG;
