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

  /** الفريقان */
  teams: {
    red: { name: "الأحمر", direction: "horizontal" as const },
    green: { name: "الأخضر", direction: "vertical" as const },
  },

  /** مزايا إضافية: شغّل أو أطفئ أي واحدة */
  features: {
    /** خلايا مخفية سؤالها أصعب، والفائز بها ياخذ معها خلية مجاورة */
    goldenCells: { enabled: true, perBoard: 2 },
    /** تحدي خلية الخصم بسؤال أصعب */
    stealCell: { enabled: true, perRound: 1 },
    /** وسيلة مساعدة واحدة لكل فريق في الجولة */
    helpers: { enabled: true, perRound: 1, kinds: ["extraClue", "changeQuestion"] as const },
    /** بعد الفوز بالمباراة: لاعب واحد يكمل مساراً خلال وقت محدد */
    finalRound: { enabled: true, seconds: 60 },
  },

  /** الصوت الافتراضي (اللاعب يقدر يغيّره) */
  sound: { music: 0.35, sfx: 0.8, musicBpm: 104 },
} as const;

export type GameConfig = typeof GAME_CONFIG;
