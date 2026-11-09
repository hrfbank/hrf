import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="state">
      <span className="state-glyph" aria-hidden="true">٤٠٤</span>
      <p>الصفحة غير موجودة.</p>
      <Link to="/" className="btn primary">للرئيسية</Link>
    </div>
  );
}
