import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { LangProvider, useLang } from "./context/LangContext";
import Collection from "./pages/Collection";
import Missing from "./pages/Missing";
import AddItem from "./pages/AddItem";
import Catalog from "./pages/Catalog";
import { get } from "./api";
import "./index.css";

function AppInner() {
  const { dark, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, t } = useLang();
  const [tab, setTab] = useState("collection");
  const [stats, setStats] = useState(null);

  function loadStats() {
    get("/stats").then(setStats).catch(() => {});
  }

  useEffect(() => { loadStats(); }, [tab]);

  const TABS = [
    { id: "collection", label: t.tabs.collection, icon: "🗃️" },
    { id: "add",        label: t.tabs.add,        icon: "➕" },
    { id: "missing",    label: t.tabs.missing,    icon: "🔍" },
    { id: "catalog",    label: t.tabs.catalog,    icon: "📚" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              🎭 Catalog Collections
            </h1>
            {stats && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t.appSubtitle(stats.total_owned, stats.missing_from_catalog)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              title="Switch language"
              className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {lang === "pt" ? "EN" : "PT"}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="text-lg px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        <nav className="max-w-6xl mx-auto px-4 flex gap-1">
          {TABS.map((t_) => (
            <button
              key={t_.id}
              onClick={() => setTab(t_.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t_.id
                  ? "border-indigo-600 text-indigo-700 dark:text-indigo-400 dark:border-indigo-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <span>{t_.icon}</span>
              {t_.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === "collection" && <Collection />}
        {tab === "add"        && <AddItem onAdded={() => { loadStats(); setTab("collection"); }} />}
        {tab === "missing"    && <Missing />}
        {tab === "catalog"    && <Catalog onCollectionChange={loadStats} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AppInner />
      </LangProvider>
    </ThemeProvider>
  );
}
