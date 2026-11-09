import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Layout() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

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
            <span className="brand-tile">ح</span>
            <span className="brand-word">حروف</span>
          </NavLink>
          <nav className="nav" aria-label="التنقل الرئيسي">
            <NavLink to="/" end>الرئيسية</NavLink>
            <NavLink to="/categories">المجالات</NavLink>
            <NavLink to="/letters">الحروف</NavLink>
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
          <ThemeToggle />
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <footer className="footer">
        <span className="brand-tile small">ح</span>
        <p>حروف: بنك أسئلة ثقافية عربية. كل سؤال يمرّ بمرحلة تدقيق قبل نشره.</p>
      </footer>
    </div>
  );
}
