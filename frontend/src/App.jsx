import { useEffect, useState } from "react";
import Collection from "./pages/Collection";
import Missing from "./pages/Missing";
import AddItem from "./pages/AddItem";
import Catalog from "./pages/Catalog";
import { get } from "./api";
import "./index.css";

const TABS = [
  { id: "collection", label: "Minha Coleção", icon: "🗃️" },
  { id: "add", label: "Adicionar", icon: "➕" },
  { id: "missing", label: "Faltando", icon: "🔍" },
  { id: "catalog", label: "Catálogo", icon: "📚" },
];

export default function App() {
  const [tab, setTab] = useState("collection");
  const [stats, setStats] = useState(null);

  function loadStats() {
    get("/stats").then(setStats).catch(() => {});
  }

  useEffect(() => { loadStats(); }, [tab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-indigo-700">🎭 Catalog Collections</h1>
            {stats && (
              <p className="text-xs text-gray-500 mt-0.5">
                {stats.total_owned} itens na coleção
                {stats.total_catalog > 0 && ` · ${stats.missing_from_catalog} faltando`}
              </p>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="max-w-6xl mx-auto px-4 flex gap-1 pb-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === "collection" && <Collection />}
        {tab === "add" && <AddItem onAdded={() => { loadStats(); setTab("collection"); }} />}
        {tab === "missing" && <Missing />}
        {tab === "catalog" && <Catalog />}
      </main>
    </div>
  );
}
