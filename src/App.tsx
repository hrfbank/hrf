import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CatalogContext } from "./hooks/useCatalog";
import { useAsync } from "./hooks/useAsync";
import { api } from "./lib/api";
import { Home } from "./pages/Home";
import { Categories } from "./pages/Categories";
import { CategoryPage } from "./pages/CategoryPage";
import { Letters } from "./pages/Letters";
import { LetterPage } from "./pages/LetterPage";
import { SearchPage } from "./pages/SearchPage";
import { NotFound } from "./pages/NotFound";
import { Sounds } from "./pages/Sounds";
import { Play } from "./pages/Play";
import { Login } from "./pages/Login";
import { HowTo } from "./pages/HowTo";
import { SettingsPage } from "./pages/SettingsPage";
import { AuthProvider, useAuth } from "./lib/auth";
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

/** اللعبة لصاحب حساب، لما يكون تسجيل الدخول مفعّل */
function RequireOwner({ children }: { children: ReactNode }) {
  const { enabled, loading, player } = useAuth();
  const location = useLocation();
  if (!enabled) return <>{children}</>;
  if (loading) return null;
  if (!player) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

/** بنك الأسئلة والأجوبة سري: صفحات التصفح لصاحب اللعبة بس */
function RequireAdmin({ children }: { children: ReactNode }) {
  const { loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  const { data, loading, error } = useAsync(
    () => Promise.all([api.categories(), api.letterCounts()]),
    [],
  );
  const catalog = {
    categories: data?.[0] ?? [],
    letterCounts: data?.[1] ?? [],
    loading,
    error,
  };

  return (
    <AuthProvider>
    <CatalogContext.Provider value={catalog}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="categories" element={<RequireAdmin><Categories /></RequireAdmin>} />
            <Route path="c/:slug" element={<RequireAdmin><CategoryPage /></RequireAdmin>} />
            <Route path="letters" element={<RequireAdmin><Letters /></RequireAdmin>} />
            <Route path="letter/:letter" element={<RequireAdmin><LetterPage /></RequireAdmin>} />
            <Route path="search" element={<RequireAdmin><SearchPage /></RequireAdmin>} />
            <Route path="sounds" element={<Sounds />} />
            <Route path="play" element={<RequireOwner><Play /></RequireOwner>} />
            <Route path="login" element={<Login />} />
            <Route path="how" element={<HowTo />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </CatalogContext.Provider>
    </AuthProvider>
  );
}
