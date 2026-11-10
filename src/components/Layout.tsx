import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth";
import { BrandLogo } from "./BrandLogo";
import brandIcon from "../assets/brand/icon.svg";

export function Layout() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { enabled, player, signOut } = useAuth();

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand" aria-label="حروف، الصفحة الرئيسية">
            <BrandLogo />
          </NavLink>
          <nav className="nav" aria-label="التنقل الرئيسي">
            <NavLink to="/" end>الرئيسية</NavLink>
            <NavLink to="/categories">المجالات</NavLink>
            <NavLink to="/how">كيف تلعب</NavLink>
            <NavLink to="/play" className="nav-play">العب</NavLink>
          </nav>
          <form className="top-search" role="search" onSubmit={onSearch}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في الأسئلة والأجوبة"
              aria-label="ابحث في الأسئلة والأجوبة"
            />
          </form>
          <NavLink to="/settings" className="icon-btn" aria-label="الإعدادات" title="الإعدادات">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>
          </NavLink>
          {enabled && (player ? (
            <button type="button" className="account" onClick={signOut} title="تسجيل الخروج">
              {player.avatar ? <img src={player.avatar} alt="" /> : <span>{player.name.charAt(0)}</span>}
              <em>خروج</em>
            </button>
          ) : (
            <NavLink to="/login" className="btn ghost account-login">دخول</NavLink>
          ))}
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <footer className="footer">
        <img src={brandIcon} alt="" className="footer-icon" />
        <p>حروف: بنك أسئلة ثقافية عربية. كل سؤال يمرّ بمرحلة تدقيق قبل نشره.</p>
        <NavLink to="/letters" className="link">تصفّح بالحروف</NavLink>
        <NavLink to="/how" className="link">كيف تلعب</NavLink>
        <NavLink to="/settings" className="link">الإعدادات</NavLink>
      </footer>
    </div>
  );
}
