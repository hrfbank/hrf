export const LETTERS = [
  "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص",
  "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",
] as const;

export type Letter = (typeof LETTERS)[number];

export function isLetter(value: string | undefined): value is Letter {
  return !!value && (LETTERS as readonly string[]).includes(value);
}
