import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type Provider } from "../lib/auth";
import { BrandLogo } from "../components/BrandLogo";

const HERO_LETTERS = ["ح", "ر", "و", "ف"];

export function Login() {
  const { enabled, player, signIn } = useAuth();
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const back = (location.state as { from?: string } | null)?.from ?? "/play";

  if (player) return <Navigate to={back} replace />;

  async function go(p: Provider) {
    setBusy(p);
    setError(null);
    const err = await signIn(p);
    if (err) {
      setError(`ما قدرنا نكمل تسجيل الدخول: ${err}`);
      setBusy(null);
    }
  }

  return (
    <section className="login">
      <div className="login-tiles" aria-hidden="true">
        {HERO_LETTERS.map((l, i) => <span key={l} className={`hero-tile t${i}`}>{l}</span>)}
      </div>
      <div className="login-card">
        <BrandLogo className="login-logo" />
        <h1>أهلاً في حروف</h1>
        <p className="lead">سجّل دخولك بضغطة وحدة، ونسوي لك حساب تلقائياً. تحتاجه بس لصاحب اللعبة، والفرق يدخلون بالباركود بدون تسجيل.</p>

        <div className="login-buttons">
          <button type="button" className="auth-btn apple" disabled={!enabled || !!busy} onClick={() => go("apple")}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-3.9ZM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4Z" /></svg>
            {busy === "apple" ? "جارٍ التحويل…" : "المتابعة مع Apple"}
          </button>
          <button type="button" className="auth-btn google" disabled={!enabled || !!busy} onClick={() => go("google")}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-7.9Z" />
              <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.7-2.8Z" />
              <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4Z" />
            </svg>
            {busy === "google" ? "جارٍ التحويل…" : "المتابعة مع Google"}
          </button>
        </div>

        {error && <p className="login-error" role="alert">{error}</p>}
        {!enabled && (
          <p className="login-note">
            تسجيل الدخول يشتغل في نسخة اللعبة المنشورة على الإنترنت. هذه نسخة تجربة داخل Claude، فتقدر تلعب بدون تسجيل.
          </p>
        )}
      </div>
    </section>
  );
}
