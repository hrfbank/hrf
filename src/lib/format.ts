const numberFormat = new Intl.NumberFormat("ar-u-nu-arab");

export const formatNumber = (n: number) => numberFormat.format(n);

/** "سؤال" بصيغة العدد الصحيحة */
export function questionsLabel(n: number): string {
  if (n === 0) return "لا أسئلة";
  if (n === 1) return "سؤال واحد";
  if (n === 2) return "سؤالان";
  const mod100 = n % 100;
  if (mod100 >= 3 && mod100 <= 10) return `${formatNumber(n)} أسئلة`;
  return `${formatNumber(n)} سؤال`;
}
