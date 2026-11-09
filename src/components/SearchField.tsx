import { useEffect, useState } from "react";

type Props = { value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean };

/** حقل بحث يرسل القيمة بعد توقف الكتابة */
export function SearchField({ value, onChange, placeholder = "ابحث في الأسئلة والأجوبة", autoFocus }: Props) {
  const [text, setText] = useState(value);

  useEffect(() => setText(value), [value]);

  useEffect(() => {
    if (text === value) return;
    const t = setTimeout(() => onChange(text.trim()), 350);
    return () => clearTimeout(t);
  }, [text, value, onChange]);

  return (
    <label className="search-field">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
      />
    </label>
  );
}
