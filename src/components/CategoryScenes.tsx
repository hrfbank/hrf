// مشاهد باقي الفئات بنفس الأسلوب اليدوي (حبر + ألوان مائية + ورق).
// كل مشهد 400×300، ويرجّع طبقتين: wash (الألوان) و lines (الحبر)، و extra اختياري (توهج).
import type { ReactElement } from "react";

const INK = "#1b2430";
const TIF = "#0abab5";
const NEON = "#e4ff1a";
const SAND = "#f1d39a";
const SAND_D = "#d9a95e";
const WOOD = "#b8743a";
const GOLD = "#f2c94c";
const CORAL = "#ff8a7a";
const NIGHT = "#1d2f52";
const GREEN = "#6aa86b";

export type Scene = { wash: ReactElement; lines: ReactElement; extra?: (glow: string) => ReactElement };

const k = (w = 3.2) => ({ stroke: INK, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" });
const bg = (c: string) => <rect width="400" height="300" fill={c} />;
const dunes = (c = SAND, d = SAND_D) => (
  <>
    <path d="M0 230 Q100 190 200 222 T400 210 V300 H0Z" fill={c} />
    <path d="M0 262 Q120 236 240 258 T400 250 V300 H0Z" fill={d} />
  </>
);
const dunesLines = <path d="M0 230 Q100 190 200 222 T400 210 M0 262 Q120 236 240 258 T400 250" {...k(2.4)} />;
const halo = (cx: number, cy: number, r: number, c = "#fff4b0") => (glow: string) => (
  <circle cx={cx} cy={cy} r={r} fill={c} opacity="0.65" filter={`url(#${glow})`} />
);

export const MORE_SCENES: Record<string, Scene> = {
  // مناطق الكويت: دبوس خريطة فوق بيوت وكثبان
  "kuwait-regions": {
    wash: (<>{bg("#ffd9a8")}{dunes()}
      <rect x="70" y="170" width="60" height="50" fill="#f6efe1" /><rect x="140" y="150" width="70" height="70" fill="#e9dcc2" /><rect x="220" y="176" width="54" height="44" fill="#f6efe1" />
      <path d="M200 40 q-40 0 -40 40 q0 34 40 76 q40 -42 40 -76 q0 -40 -40 -40z" fill={TIF} /><circle cx="200" cy="80" r="16" fill="#fff" /></>),
    lines: (<>{dunesLines}
      <path d="M70 220 V170 H130 V220 M140 220 V150 H210 V220 M220 220 V176 H274 V220" {...k(2.6)} />
      <path d="M86 186 h12 v12 h-12z M160 168 h14 v14 h-14z M184 168 h14 v14 h-14z M236 190 h12 v12 h-12z" {...k(2)} />
      <path d="M200 40 q-40 0 -40 40 q0 34 40 76 q40 -42 40 -76 q0 -40 -40 -40z" {...k()} /><circle cx="200" cy="80" r="16" {...k(2.6)} /></>),
  },
  // السعودية: قصر طيني بأبراج ونخلة
  saudi: {
    wash: (<>{bg("#ffcf8a")}{dunes()}
      <path d="M90 230 V130 H310 V230Z" fill="#c98a52" /><path d="M70 230 V100 H120 V230Z M280 230 V100 H330 V230Z" fill="#b5733d" />
      <rect x="180" y="170" width="40" height="60" fill="#6b3b1a" />
      <path d="M40 230 Q44 170 40 120" stroke={WOOD} strokeWidth="10" fill="none" /><ellipse cx="40" cy="112" rx="36" ry="14" fill={GREEN} /></>),
    lines: (<>{dunesLines}
      <path d="M90 230 V130 H310 V230 M70 230 V100 H120 V230 M280 230 V100 H330 V230" {...k()} />
      <path d="M70 100 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 M280 100 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 M120 130 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8" {...k(2.4)} />
      <path d="M180 230 V170 H220 V230 M92 150 v20 M98 150 v20 M302 150 v20 M308 150 v20" {...k(2.4)} />
      <path d="M40 230 Q44 170 40 120 M40 116 q-30 -16 -44 4 M40 116 q30 -16 44 4 M40 112 q-10 -24 -32 -22 M40 112 q10 -24 32 -22" {...k(2.6)} /></>),
  },
  // مناطق السعودية: صخرة الفيل في العلا
  "saudi-regions": {
    wash: (<>{bg("#ffb98a")}<circle cx="320" cy="80" r="34" fill="#ffe27a" />{dunes("#f0c08a", "#d99a5c")}
      <path d="M80 236 Q70 120 170 104 Q260 96 290 150 Q312 196 300 236 H250 Q250 196 230 192 Q212 192 214 236Z" fill="#c4663a" /></>),
    lines: (<>{dunesLines}
      <path d="M80 236 Q70 120 170 104 Q260 96 290 150 Q312 196 300 236 H250 Q250 196 230 192 Q212 192 214 236Z" {...k(3.4)} />
      <path d="M120 150 q20 -10 40 0 M150 130 q30 -6 50 6 M240 150 q14 10 18 26" {...k(2)} />
      <path d="M40 60 q8 -8 16 0 q8 -8 16 0" {...k(2.2)} /></>),
  },
  // إسلامي: قبة ومئذنة وهلال
  islamic: {
    wash: (<>{bg(NIGHT)}<circle cx="80" cy="70" r="30" fill="#ffe9a8" /><circle cx="94" cy="62" r="26" fill={NIGHT} />
      <path d="M120 250 V170 Q120 110 200 96 Q280 110 280 170 V250Z" fill={TIF} /><rect x="300" y="90" width="34" height="160" fill="#e9dcc2" />
      <rect x="0" y="250" width="400" height="50" fill="#0f2240" /></>),
    extra: halo(200, 150, 70, "#9ff0e8"),
    lines: (<>
      <path d="M120 250 V170 Q120 110 200 96 Q280 110 280 170 V250 M110 250 H346" {...k()} />
      <path d="M200 96 V72 M192 64 q8 -12 16 0 q-8 -6 -16 0" {...k(2.6)} />
      <path d="M180 250 V196 Q180 176 200 172 Q220 176 220 196 V250" {...k(2.6)} />
      <path d="M300 250 V90 H334 V250 M296 90 L317 54 L338 90 M300 140 H334 M300 190 H334" {...k(2.6)} />
      <path d="M50 130 l4 8 8 2 -6 6 2 8 -8 -4 -8 4 2 -8 -6 -6 8 -2z M360 40 l3 6 6 1 -4 4 1 6 -6 -3 -6 3 1 -6 -4 -4 6 -1z" {...k(1.8)} stroke={NEON} /></>),
  },
  // السيرة: جمل في الصحراء ونخيل (الهجرة)
  seerah: {
    wash: (<>{bg("#ffc98a")}<circle cx="300" cy="90" r="38" fill="#ffe27a" />{dunes()}
      <path d="M130 200 q10 -50 50 -50 q10 -30 34 -24 q20 4 20 30 q24 10 26 44 v24 h-12 v-20 h-80 v20 h-12z" fill="#c98a52" />
      <path d="M232 150 q30 -40 40 -30 q6 10 -10 20 q-14 10 -20 22z" fill="#c98a52" />
      <path d="M50 230 Q54 180 50 140" stroke={WOOD} strokeWidth="9" fill="none" /><ellipse cx="50" cy="134" rx="32" ry="12" fill={GREEN} /></>),
    lines: (<>{dunesLines}
      <path d="M130 200 q10 -50 50 -50 q10 -30 34 -24 q20 4 20 30 q24 10 26 44 v24 h-12 v-20 h-80 v20 h-12z" {...k()} />
      <path d="M232 150 q30 -40 40 -30 q6 10 -10 20 q-14 10 -20 22z M150 224 v14 M160 224 v14 M230 224 v14 M240 224 v14" {...k(2.6)} />
      <circle cx="266" cy="128" r="2" fill={INK} />
      <path d="M50 230 Q54 180 50 140 M50 138 q-28 -14 -40 4 M50 138 q28 -14 40 4 M50 134 q-8 -22 -30 -20 M50 134 q8 -22 30 -20" {...k(2.6)} /></>),
  },
  // معلومات عامة: مصباح فكرة وكتب وعلامات استفهام
  general: {
    wash: (<>{bg("#bfe8e6")}
      <rect x="100" y="230" width="200" height="22" fill={CORAL} /><rect x="116" y="210" width="170" height="22" fill={TIF} /><rect x="130" y="190" width="140" height="22" fill={NEON} />
      <circle cx="200" cy="110" r="52" fill="#fff3a0" /><rect x="182" y="160" width="36" height="28" fill="#c7cdd3" /></>),
    extra: halo(200, 110, 70),
    lines: (<>
      <path d="M100 230 h200 v22 h-200z M116 210 h170 v22 h-170z M130 190 h140 v22 h-140z" {...k(2.6)} />
      <path d="M182 160 Q150 140 150 110 a50 50 0 0 1 100 0 Q250 140 218 160Z M182 160 h36 v28 h-36z M184 170 h32 M184 180 h32" {...k()} />
      <path d="M188 150 q12 -40 24 0" {...k(2.4)} />
      <path d="M60 80 q0 -22 22 -22 q22 0 22 20 q0 14 -18 20 v12 M86 128 v2 M320 70 q0 -18 18 -18 q18 0 18 16 q0 12 -14 16 v10 M342 112 v2" {...k(3)} stroke={TIF} />
      <path d="M140 60 v-16 M260 60 l10 -12 M120 96 h-16 M296 96 h16" {...k(2.6)} stroke="#e0a43a" /></>),
  },
  // لغة وأدب: محبرة وريشة وورقة
  "language-literature": {
    wash: (<>{bg("#d9c7f0")}<path d="M70 60 L300 50 L320 250 L60 262Z" fill="#fffaf0" />
      <path d="M260 200 h70 l-8 50 h-54z" fill="#2f3f6e" /><path d="M300 200 Q340 100 380 40 Q350 120 310 200z" fill="#fff" /></>),
    lines: (<>
      <path d="M70 60 L300 50 L320 250 L60 262Z" {...k()} />
      <path d="M96 100 h170 M94 128 h176 M92 156 h150 M90 184 h120" {...k(2.4)} stroke="#6a7fb0" />
      <path d="M260 200 h70 l-8 50 h-54z M270 200 v-10 h50 v10" {...k(2.8)} />
      <path d="M300 200 Q340 100 380 40 Q350 120 310 200z M312 160 l20 -10 M322 130 l22 -12 M334 100 l20 -12" {...k(2.4)} /></>),
  },
  // شعر عربي: لفافة شعر وقمر فوق خيمة
  "arabic-poetry": {
    wash: (<>{bg(NIGHT)}<circle cx="320" cy="70" r="30" fill="#ffe9a8" />{dunes("#3a4f7a", "#2a3b60")}
      <path d="M80 110 h220 v100 h-220z" fill="#f6e7c4" /><ellipse cx="80" cy="160" rx="16" ry="50" fill="#e0c891" /><ellipse cx="300" cy="160" rx="16" ry="50" fill="#e0c891" /></>),
    extra: halo(320, 70, 40, "#ffe9a8"),
    lines: (<>
      <path d="M80 110 h220 M80 210 h220" {...k()} />
      <ellipse cx="80" cy="160" rx="16" ry="50" {...k()} /><ellipse cx="300" cy="160" rx="16" ry="50" {...k()} />
      <path d="M110 140 q30 -8 60 0 M196 140 q30 -8 60 0 M110 170 q30 -8 60 0 M196 170 q30 -8 60 0" {...k(2.6)} stroke="#7a4a1d" />
      <path d="M183 130 v50" {...k(1.6)} strokeDasharray="4 6" />
      <path d="M40 40 l3 6 6 1 -4 4 1 6 -6 -3 -6 3 1 -6 -4 -4 6 -1z M200 40 l3 6 6 1 -4 4 1 6 -6 -3 -6 3 1 -6 -4 -4 6 -1z" {...k(1.8)} stroke={NEON} /></>),
  },
  // شعر نبطي: دلة وفنجان ونار بجانب خيمة
  "nabati-poetry": {
    wash: (<>{bg("#2b2340")}{dunes("#6b4d3a", "#54392b")}
      <path d="M40 220 L120 120 L200 220Z" fill="#3a2c22" />
      <path d="M260 120 q-30 0 -30 40 l-10 60 h80 l-10 -60 q0 -40 -30 -40z" fill={GOLD} /><path d="M236 140 l-30 -16" stroke={GOLD} strokeWidth="10" />
      <path d="M150 250 q20 -40 30 -60 q10 30 30 60z" fill="#ff9a3c" /><rect x="320" y="200" width="30" height="24" fill="#f6efe1" /></>),
    extra: halo(180, 230, 50, "#ffb24a"),
    lines: (<>{dunesLines}
      <path d="M40 220 L120 120 L200 220 M120 120 V220 M96 220 L120 168 L144 220" {...k(2.8)} />
      <path d="M260 120 q-30 0 -30 40 l-10 60 h80 l-10 -60 q0 -40 -30 -40z M236 140 l-30 -16 l-6 10 M256 112 h8 v8 h-8z M230 170 h60" {...k()} />
      <path d="M150 250 q20 -40 30 -60 q10 30 30 60z M140 256 h80" {...k(2.6)} />
      <path d="M320 200 h30 v24 h-30z M350 206 q10 0 8 10 l-8 2" {...k(2.4)} /></>),
  },
  // من القائل: فقاعة كلام بعلامتي اقتباس وميكروفون
  "who-said": {
    wash: (<>{bg("#ffd6c9")}<path d="M70 60 h220 q30 0 30 30 v80 q0 30 -30 30 h-150 l-40 40 v-40 h-30 q-30 0 -30 -30 v-80 q0 -30 30 -30z" fill="#fff" />
      <rect x="300" y="140" width="40" height="70" rx="20" fill="#9aa7b4" /></>),
    lines: (<>
      <path d="M70 60 h220 q30 0 30 30 v80 q0 30 -30 30 h-150 l-40 40 v-40 h-30 q-30 0 -30 -30 v-80 q0 -30 30 -30z" {...k()} />
      <path d="M120 110 q-14 0 -14 16 q0 14 14 14 q0 14 -14 20 M166 110 q-14 0 -14 16 q0 14 14 14 q0 14 -14 20" {...k(5)} stroke={TIF} />
      <path d="M200 110 h80 M200 136 h70 M200 162 h50" {...k(2.6)} stroke="#9aa7b4" />
      <rect x="300" y="140" width="40" height="70" rx="20" {...k()} />
      <path d="M290 190 q0 40 30 40 q30 0 30 -40 M320 230 v30 M300 262 h40" {...k(2.8)} /></>),
  },
  // ألقاب وكنى: تاج وبطاقة اسم
  "titles-nicknames": {
    wash: (<>{bg("#c9e9ff")}<path d="M110 160 L130 80 L170 130 L200 60 L230 130 L270 80 L290 160Z" fill={GOLD} /><rect x="110" y="160" width="180" height="24" fill="#e0a43a" />
      <circle cx="200" cy="60" r="10" fill={CORAL} /><circle cx="130" cy="80" r="8" fill={TIF} /><circle cx="270" cy="80" r="8" fill={TIF} />
      <rect x="120" y="210" width="160" height="60" rx="10" fill="#fff" /></>),
    extra: halo(200, 120, 60),
    lines: (<>
      <path d="M110 160 L130 80 L170 130 L200 60 L230 130 L270 80 L290 160Z M110 160 h180 v24 h-180z" {...k()} />
      <circle cx="200" cy="60" r="10" {...k(2.6)} /><circle cx="130" cy="80" r="8" {...k(2.6)} /><circle cx="270" cy="80" r="8" {...k(2.6)} />
      <rect x="120" y="210" width="160" height="60" rx="10" {...k()} />
      <path d="M140 232 h50 M140 250 h90" {...k(3)} stroke={TIF} /><path d="M120 222 h160" {...k(2)} stroke={CORAL} /></>),
  },
  // مترادفات وتضاد: بطاقتان بينهما يساوي وسهمان متعاكسان
  "synonyms-antonyms": {
    wash: (<>{bg("#e6f7c8")}<rect x="40" y="70" width="120" height="150" rx="14" fill={TIF} /><rect x="240" y="70" width="120" height="150" rx="14" fill={NEON} /></>),
    lines: (<>
      <rect x="40" y="70" width="120" height="150" rx="14" {...k()} /><rect x="240" y="70" width="120" height="150" rx="14" {...k()} />
      <path d="M180 130 h40 M180 150 h40" {...k(5)} />
      <path d="M70 250 h100 l-14 -10 M170 250 l-14 10 M330 270 h-100 l14 -10 M230 270 l14 10" {...k(3.4)} stroke={CORAL} />
      <path d="M80 120 q20 -20 40 0 M80 150 h40 M280 120 l40 30 M320 120 l-40 30" {...k(4)} stroke="#fff" /></>),
  },
  // تاريخ: ساعة رملية ولفافة وعمود أثري
  history: {
    wash: (<>{bg("#f0dcc0")}<rect x="40" y="70" width="60" height="180" fill="#e6d3b3" /><rect x="30" y="56" width="80" height="16" fill="#d7c09b" />
      <path d="M180 60 h80 l-36 70 l36 70 h-80 l36 -70z" fill="#cfe9ff" /><path d="M196 92 h48 l-24 30z M200 196 q20 -26 40 0z" fill={SAND_D} />
      <path d="M290 150 h80 v90 h-80z" fill="#f6e7c4" /></>),
    lines: (<>
      <path d="M40 70 h60 v180 h-60z M30 56 h80 v16 h-80z M30 250 h80 M54 80 v160 M70 80 v160 M86 80 v160" {...k(2.6)} />
      <path d="M170 56 h100 M170 204 h100 M180 60 l40 70 l-40 70 M260 60 l-40 70 l40 70" {...k()} />
      <path d="M290 150 h80 v90 h-80z M290 150 q-14 0 -14 14 q0 14 14 14 M300 176 h56 M300 196 h56 M300 216 h40" {...k(2.6)} /></>),
  },
  // دول وعواصم: كرة أرضية عليها دبابيس وأعلام عامة
  "countries-capitals": {
    wash: (<>{bg("#d6ecff")}<circle cx="190" cy="160" r="100" fill="#7fc6ea" />
      <path d="M130 100 q30 -20 60 0 q10 30 -20 40 q-40 0 -40 -40z M200 170 q40 -10 50 20 q-10 40 -50 30 q-20 -30 0 -50z M120 190 q20 0 24 20 q-10 20 -30 6z" fill="#8fd18a" />
      <path d="M300 60 h50 v30 h-50z" fill={CORAL} /><path d="M300 120 h50 v30 h-50z" fill={NEON} /></>),
    lines: (<>
      <circle cx="190" cy="160" r="100" {...k()} />
      <path d="M130 100 q30 -20 60 0 q10 30 -20 40 q-40 0 -40 -40z M200 170 q40 -10 50 20 q-10 40 -50 30 q-20 -30 0 -50z M120 190 q20 0 24 20 q-10 20 -30 6z" {...k(2.2)} />
      <path d="M90 160 h200 M190 60 q-50 100 0 200 M190 60 q50 100 0 200" {...k(1.6)} />
      <path d="M300 60 h50 v30 h-50z M300 120 h50 v30 h-50z M300 50 v200" {...k(2.6)} />
      <path d="M170 116 v-20 M226 186 v-20" {...k(3)} /><circle cx="170" cy="92" r="7" fill={CORAL} stroke={INK} strokeWidth="2.4" /><circle cx="226" cy="162" r="7" fill={NEON} stroke={INK} strokeWidth="2.4" /></>),
  },
  // جغرافيا: جبل ونهر ووردة اتجاهات
  geography: {
    wash: (<>{bg("#bfe6f5")}<path d="M0 230 L110 90 L180 170 L250 70 L400 230 V300 H0Z" fill="#8dbb7a" /><path d="M230 96 L250 70 L272 100 Z M96 108 L110 90 L126 110Z" fill="#fff" />
      <path d="M160 300 Q170 250 210 230 Q260 210 270 300Z" fill="#3fa5d8" /><circle cx="340" cy="70" r="36" fill="#f6efe1" /></>),
    lines: (<>
      <path d="M0 230 L110 90 L180 170 L250 70 L400 230 M230 96 l10 8 l10 -8 l10 8 l12 -4 M96 108 l8 6 l6 -6 l10 6" {...k()} />
      <path d="M160 300 Q170 250 210 230 Q260 210 270 300" {...k(2.6)} /><path d="M190 280 q10 -10 20 0 M220 260 q10 -10 20 0" {...k(2)} stroke="#fff" />
      <circle cx="340" cy="70" r="36" {...k(2.6)} /><path d="M340 40 l8 30 l-8 30 l-8 -30z M310 70 l30 -8 l30 8 l-30 8z" {...k(2.2)} /><path d="M340 40 l8 30 h-16z" fill={CORAL} /></>),
  },
  // ما هي الدولة: عدسة مكبرة على كرة أرضية
  "which-country": {
    wash: (<>{bg("#fff0b8")}<circle cx="170" cy="160" r="96" fill="#7fc6ea" /><path d="M110 110 q30 -20 60 0 q10 30 -20 40 q-40 0 -40 -40z M180 180 q40 -10 50 20 q-10 30 -50 26z" fill="#8fd18a" />
      <circle cx="250" cy="130" r="56" fill="#e8fbff" opacity="0.8" /><path d="M290 172 l60 60" stroke={WOOD} strokeWidth="22" strokeLinecap="round" /></>),
    lines: (<>
      <circle cx="170" cy="160" r="96" {...k()} />
      <path d="M110 110 q30 -20 60 0 q10 30 -20 40 q-40 0 -40 -40z M180 180 q40 -10 50 20 q-10 30 -50 26z" {...k(2.2)} />
      <circle cx="250" cy="130" r="56" {...k(4)} /><path d="M290 172 l60 60" {...k(4)} />
      <path d="M226 106 q14 -14 34 -10" {...k(3)} stroke="#fff" />
      <path d="M244 126 q0 -14 14 -14 q14 0 14 12 q0 10 -12 14 v8 M260 160 v2" {...k(3.4)} stroke={CORAL} /></>),
  },
  // من هو المشهور: ظل شخص تحت إضاءة مسرح مع علامة استفهام
  "who-is-famous": {
    wash: (<>{bg("#2b2350")}<path d="M150 0 L250 0 L320 300 L80 300Z" fill="#fff4b0" opacity="0.55" />
      <path d="M140 300 Q140 210 200 200 Q260 210 260 300Z" fill="#3a3366" /><circle cx="200" cy="160" r="40" fill="#3a3366" /></>),
    extra: halo(200, 40, 50, "#fff4b0"),
    lines: (<>
      <path d="M150 0 L80 300 M250 0 L320 300" {...k(1.6)} stroke="#fff4b0" />
      <path d="M140 300 Q140 210 200 200 Q260 210 260 300" {...k()} /><circle cx="200" cy="160" r="40" {...k()} />
      <path d="M184 150 q0 -18 16 -18 q16 0 16 16 q0 12 -14 16 v10 M202 186 v2" {...k(4)} stroke={NEON} />
      <path d="M40 70 l4 8 8 2 -6 6 2 8 -8 -4 -8 4 2 -8 -6 -6 8 -2z M340 90 l4 8 8 2 -6 6 2 8 -8 -4 -8 4 2 -8 -6 -6 8 -2z" {...k(2)} stroke={GOLD} /></>),
  },
  // رياضة: كأس وميدالية
  sports: {
    wash: (<>{bg("#c8f0d8")}<path d="M140 60 h120 q0 90 -60 100 q-60 -10 -60 -100z" fill={GOLD} /><rect x="186" y="160" width="28" height="40" fill="#e0a43a" /><rect x="150" y="200" width="100" height="30" fill={WOOD} />
      <circle cx="320" cy="200" r="34" fill={NEON} /><path d="M300 100 L320 170 L340 100Z" fill={TIF} /></>),
    extra: halo(200, 100, 60),
    lines: (<>
      <path d="M140 60 h120 q0 90 -60 100 q-60 -10 -60 -100z M140 76 q-40 0 -36 30 q4 26 46 30 M260 76 q40 0 36 30 q-4 26 -46 30 M186 160 h28 v40 h-28z M150 200 h100 v30 h-100z" {...k()} />
      <path d="M200 84 l6 12 13 2 -10 9 3 13 -12 -7 -12 7 3 -13 -10 -9 13 -2z" {...k(2.4)} />
      <circle cx="320" cy="200" r="34" {...k()} /><circle cx="320" cy="200" r="22" {...k(2)} /><path d="M300 100 L320 170 L340 100" {...k(2.6)} /></>),
  },
  // سيارات: سيارة كلاسيكية من الجنب
  cars: {
    wash: (<>{bg("#ffe1c2")}<rect x="0" y="236" width="400" height="64" fill="#7d8790" />
      <path d="M50 200 Q60 160 110 156 L150 110 H260 L300 156 Q350 160 356 200 V222 H50Z" fill={CORAL} /><path d="M160 120 h46 v36 h-66z M216 120 h40 l30 36 h-70z" fill="#cfefff" /></>),
    lines: (<>
      <path d="M50 200 Q60 160 110 156 L150 110 H260 L300 156 Q350 160 356 200 V222 H50Z M160 120 h46 v36 h-66z M216 120 h40 l30 36 h-70z" {...k()} />
      <circle cx="120" cy="224" r="28" fill="#2b2f36" stroke={INK} strokeWidth="3.2" /><circle cx="290" cy="224" r="28" fill="#2b2f36" stroke={INK} strokeWidth="3.2" />
      <circle cx="120" cy="224" r="10" fill="#c7cdd3" /><circle cx="290" cy="224" r="10" fill="#c7cdd3" />
      <path d="M340 186 h14 M52 186 h12 M20 262 h60 M160 262 h60 M300 262 h60" {...k(2.6)} /><path d="M356 180 l20 -6 v16z" fill={NEON} stroke={INK} strokeWidth="2" /></>),
  },
  // منتجات: كيس تسوق وصندوق
  products: {
    wash: (<>{bg("#d8eaff")}<path d="M90 110 h120 l10 150 h-140z" fill={TIF} /><path d="M230 160 l60 -30 l70 30 v90 l-70 30 l-60 -30z" fill={SAND} /><path d="M230 160 l60 30 l70 -30 l-70 -30z" fill="#f6e3b6" /></>),
    lines: (<>
      <path d="M90 110 h120 l10 150 h-140z M120 110 q0 -40 30 -40 q30 0 30 40" {...k()} />
      <path d="M230 160 l60 -30 l70 30 v90 l-70 30 l-60 -30z M230 160 l60 30 l70 -30 M290 190 v90" {...k()} />
      <path d="M262 144 l60 30 v20" {...k(2.4)} stroke={CORAL} />
      <path d="M130 170 l12 -20 l12 20 l12 -20 l12 20" {...k(2.6)} stroke="#fff" /></>),
  },
  // مطاعم: طبق بغطاء وشوكة وسكين
  restaurants: {
    wash: (<>{bg("#ffe6cf")}<ellipse cx="200" cy="220" rx="130" ry="26" fill="#fff" /><path d="M100 214 Q100 110 200 104 Q300 110 300 214Z" fill="#c7d3dd" /><circle cx="200" cy="96" r="12" fill="#9aa7b4" /></>),
    lines: (<>
      <ellipse cx="200" cy="220" rx="130" ry="26" {...k()} /><path d="M100 214 Q100 110 200 104 Q300 110 300 214 M200 84 v20" {...k()} /><circle cx="200" cy="96" r="12" {...k(2.6)} />
      <path d="M140 150 q20 -30 50 -34" {...k(3.4)} stroke="#fff" />
      <path d="M40 120 v60 M30 120 v24 q0 10 10 10 q10 0 10 -10 v-24 M40 180 v80 M360 120 q16 10 10 60 h-10 v80" {...k(3)} /></>),
  },
  // مجمعات: مبنى بقبة زجاجية وأكياس تسوق
  malls: {
    wash: (<>{bg("#cfe8ff")}<rect x="60" y="130" width="280" height="120" fill="#e9e2d6" /><path d="M140 130 Q200 60 260 130Z" fill="#9ed8f0" />
      <rect x="180" y="190" width="40" height="60" fill="#7fc6ea" /><path d="M300 220 h40 l6 50 h-52z" fill={CORAL} /><path d="M40 230 h34 l6 40 h-46z" fill={NEON} /></>),
    lines: (<>
      <path d="M60 130 h280 v120 h-280z M140 130 Q200 60 260 130 M200 74 v56 M170 92 l10 38 M230 92 l-10 38" {...k()} />
      <path d="M180 190 h40 v60 h-40z M200 190 v60 M80 150 h40 v24 h-40z M280 150 h40 v24 h-40z M80 196 h40 v24 h-40z" {...k(2.4)} />
      <path d="M300 220 h40 l6 50 h-52z M310 220 q0 -16 10 -16 q10 0 10 16 M40 230 h34 l6 40 h-46z M48 230 q0 -14 9 -14 q9 0 9 14" {...k(2.6)} /></>),
  },
  // مسرحيات كويتية: ستارة مسرح وقناعان
  "kuwaiti-plays": {
    wash: (<>{bg("#3b1d2e")}<path d="M0 0 H400 V40 Q300 70 200 40 Q100 70 0 40Z" fill="#b2322d" /><path d="M0 0 h70 q-10 150 20 300 H0Z M400 0 h-70 q10 150 -20 300 H400Z" fill="#c9403a" />
      <rect x="0" y="260" width="400" height="40" fill={WOOD} /><circle cx="170" cy="150" r="44" fill="#fff6e0" /><circle cx="240" cy="170" r="40" fill={NEON} /></>),
    extra: halo(200, 160, 80, "#ffe9a8"),
    lines: (<>
      <path d="M0 40 Q100 70 200 40 Q300 70 400 40 M70 0 q-10 150 20 300 M330 0 q10 150 -20 300 M0 260 H400" {...k()} />
      <circle cx="170" cy="150" r="44" {...k()} /><path d="M150 138 q8 -8 16 0 M178 138 q8 -8 16 0 M150 166 q20 20 40 0" {...k(3)} />
      <circle cx="240" cy="170" r="40" {...k()} /><path d="M222 160 q8 6 16 0 M248 160 q8 6 16 0 M224 192 q18 -16 36 0" {...k(3)} /></>),
  },
  // إكسسوارات نسائية: عقد وخاتم وحقيبة
  "womens-accessories": {
    wash: (<>{bg("#ffd9e6")}<path d="M220 140 h120 l14 110 h-148z" fill={TIF} /><path d="M80 80 q60 120 120 0" stroke={GOLD} strokeWidth="10" fill="none" /><circle cx="140" cy="150" r="14" fill={CORAL} />
      <circle cx="110" cy="230" r="26" fill="none" stroke={GOLD} strokeWidth="10" /><path d="M110 196 l10 -10 l10 10 l-10 10z" fill="#cfefff" /></>),
    lines: (<>
      <path d="M220 140 h120 l14 110 h-148z M250 140 q0 -40 30 -40 q30 0 30 40 M232 176 h104" {...k()} /><rect x="268" y="168" width="24" height="18" rx="3" fill={GOLD} stroke={INK} strokeWidth="2.6" />
      <path d="M80 80 q60 120 120 0" {...k(2.4)} /><circle cx="140" cy="150" r="14" {...k(2.6)} />
      {[100, 116, 164, 180].map((x, i) => <circle key={i} cx={x} cy={[118, 134, 134, 118][i]} r="5" fill="#fff" stroke={INK} strokeWidth="2" />)}
      <circle cx="110" cy="230" r="26" {...k(2.6)} /><path d="M110 196 l10 -10 l10 10 l-10 10z" {...k(2.4)} /></>),
  },
  // خرايط: خريطة مطوية ومسار منقط وعلامة X
  maps: {
    wash: (<>{bg("#c9ecf5")}<path d="M50 70 L150 50 L250 70 L350 50 V240 L250 260 L150 240 L50 260Z" fill="#f3e2b8" /><path d="M150 50 L250 70 V260 L150 240Z" fill="#e8d3a2" />
      <path d="M80 110 q30 -20 50 10 q-10 30 -40 20z M270 150 q40 -10 50 30 q-30 20 -50 -4z" fill="#a8d29a" /></>),
    lines: (<>
      <path d="M50 70 L150 50 L250 70 L350 50 V240 L250 260 L150 240 L50 260Z M150 50 V240 M250 70 V260" {...k()} />
      <path d="M80 110 q30 -20 50 10 q-10 30 -40 20z M270 150 q40 -10 50 30 q-30 20 -50 -4z" {...k(2)} />
      <path d="M90 220 q40 -60 100 -30 q60 30 110 -80" {...k(3)} strokeDasharray="7 9" stroke="#b03a2e" />
      <path d="M290 98 l20 20 M310 98 l-20 20" {...k(5)} stroke={CORAL} /><circle cx="90" cy="220" r="7" fill={TIF} stroke={INK} strokeWidth="2.4" /></>),
  },
  // خمّن الصورة: إطار صورة فيه علامة استفهام وكاميرا
  "guess-image": {
    wash: (<>{bg("#e8dcff")}<rect x="70" y="60" width="200" height="170" fill="#fff" /><rect x="88" y="78" width="164" height="134" fill="#9ed8f0" />
      <path d="M88 212 L150 150 L190 190 L220 160 L252 192 V212Z" fill="#8fd18a" /><rect x="250" y="180" width="110" height="74" rx="12" fill="#3c4a5c" /><circle cx="305" cy="217" r="24" fill="#9ed8f0" /></>),
    lines: (<>
      <rect x="70" y="60" width="200" height="170" {...k()} /><rect x="88" y="78" width="164" height="134" {...k(2.4)} />
      <path d="M88 212 L150 150 L190 190 L220 160 L252 192" {...k(2.4)} />
      <path d="M150 120 q0 -24 22 -24 q22 0 22 22 q0 16 -18 20 v14 M176 168 v2" {...k(5)} stroke={CORAL} />
      <rect x="250" y="180" width="110" height="74" rx="12" {...k()} /><circle cx="305" cy="217" r="24" {...k(2.6)} /><path d="M270 180 l10 -14 h30 l10 14" {...k(2.6)} /></>),
  },
  // مسلسلات خليجية: تلفزيون قديم بزر تشغيل
  "gulf-series": {
    wash: (<>{bg("#ffe3b0")}<rect x="80" y="80" width="240" height="170" rx="20" fill={WOOD} /><rect x="104" y="102" width="160" height="126" rx="12" fill="#2f5b7a" />
      <path d="M170 136 v58 l50 -29z" fill={NEON} /><circle cx="292" cy="130" r="12" fill="#e0a43a" /><circle cx="292" cy="170" r="12" fill="#e0a43a" /></>),
    extra: halo(184, 165, 60, "#9fe8ff"),
    lines: (<>
      <rect x="80" y="80" width="240" height="170" rx="20" {...k()} /><rect x="104" y="102" width="160" height="126" rx="12" {...k(2.6)} />
      <path d="M170 136 v58 l50 -29z" {...k(2.6)} /><circle cx="292" cy="130" r="12" {...k(2.4)} /><circle cx="292" cy="170" r="12" {...k(2.4)} />
      <path d="M160 80 l-40 -50 M240 80 l40 -50 M110 250 l-10 24 M290 250 l10 24" {...k(3)} /></>),
  },
  // ممثلون: لوح تصوير ونجمة
  actors: {
    wash: (<>{bg("#c9f0ec")}<rect x="90" y="120" width="220" height="130" rx="10" fill="#2b2f36" /><path d="M90 90 L300 60 L306 100 L96 130Z" fill="#2b2f36" />
      <path d="M310 40 l14 28 30 4 -22 21 6 30 -28 -15 -28 15 6 -30 -22 -21 30 -4z" fill={NEON} /></>),
    lines: (<>
      <rect x="90" y="120" width="220" height="130" rx="10" {...k()} /><path d="M90 90 L300 60 L306 100 L96 130Z" {...k()} />
      <path d="M130 84 l14 40 M180 77 l14 40 M230 70 l14 40 M280 63 l14 40" {...k(6)} stroke="#fff" />
      <path d="M110 160 h180 M110 200 h180" {...k(2.4)} stroke="#c7cdd3" />
      <path d="M310 40 l14 28 30 4 -22 21 6 30 -28 -15 -28 15 6 -30 -22 -21 30 -4z" {...k(2.8)} /></>),
  },
  // أماكن يزورها الناس: حقيبة سفر وطائرة وطابع
  "famous-places": {
    wash: (<>{bg("#bfe6f5")}<rect x="90" y="130" width="160" height="120" rx="16" fill={CORAL} /><rect x="140" y="104" width="60" height="26" rx="8" fill="none" />
      <path d="M270 70 l90 -20 l-30 20 l30 10z" fill="#fff" /><rect x="270" y="170" width="90" height="70" fill="#fff6e0" /><circle cx="315" cy="205" r="20" fill={TIF} /></>),
    lines: (<>
      <rect x="90" y="130" width="160" height="120" rx="16" {...k()} /><path d="M140 130 v-18 q0 -8 8 -8 h44 q8 0 8 8 v18 M130 130 v120 M210 130 v120" {...k(2.8)} />
      <circle cx="120" cy="256" r="8" fill={INK} /><circle cx="220" cy="256" r="8" fill={INK} />
      <path d="M270 70 l90 -20 l-30 20 l30 10z M150 60 q60 -30 120 10" {...k(2.6)} /><path d="M150 60 q60 -30 120 10" {...k(1.6)} strokeDasharray="6 8" />
      <rect x="270" y="170" width="90" height="70" {...k(2.4)} strokeDasharray="5 4" /><circle cx="315" cy="205" r="20" {...k(2.4)} /><path d="M300 210 l10 -14 l10 10 l10 -8" {...k(2)} stroke="#fff" /></>),
  },
};
