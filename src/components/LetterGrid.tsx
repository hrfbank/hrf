import { Link } from "react-router-dom";
import { LETTERS } from "../lib/letters";
import { formatNumber } from "../lib/format";

type Props = {
  counts: Record<string, number>;
  active?: string;
  /** رابط كل حرف، أو null لو الحرف يعمل كفلتر داخل الصفحة */
  hrefFor?: (letter: string) => string;
  onSelect?: (letter: string | undefined) => void;
  size?: "lg" | "sm";
};

export function LetterGrid({ counts, active, hrefFor, onSelect, size = "lg" }: Props) {
  return (
    <div className={`letters letters-${size}`} role="list">
      {LETTERS.map((l, i) => {
        const n = counts[l] ?? 0;
        const cls = `letter-tile${n === 0 ? " empty" : ""}${active === l ? " active" : ""}`;
        const content = (
          <>
            <span className="glyph">{l}</span>
            <span className="n">{n ? formatNumber(n) : "—"}</span>
          </>
        );
        const style = { animationDelay: `${i * 18}ms` };
        const label = `حرف ${l}، ${n ? formatNumber(n) : "لا"} أسئلة`;
        if (hrefFor) {
          return (
            <Link key={l} role="listitem" to={hrefFor(l)} className={cls} style={style} aria-label={label}>
              {content}
            </Link>
          );
        }
        return (
          <button
            key={l}
            role="listitem"
            type="button"
            className={cls}
            style={style}
            aria-label={label}
            aria-pressed={active === l}
            onClick={() => onSelect?.(active === l ? undefined : l)}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
