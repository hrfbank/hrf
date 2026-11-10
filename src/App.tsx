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
    <CatalogContext.Provider value={catalog}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="categories" element={<Categories />} />
            <Route path="c/:slug" element={<CategoryPage />} />
            <Route path="letters" element={<Letters />} />
            <Route path="letter/:letter" element={<LetterPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="sounds" element={<Sounds />} />
            <Route path="play" element={<Play />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </CatalogContext.Provider>
  );
}
