import { useEffect, useState } from "react";
import { useLang } from "../context/LangContext";
import { get, post, del } from "../api";

function ProgressBar({ value, max }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  const color =
    pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-indigo-500" : "bg-amber-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

function SeriesPanel({ series, items, onDeleteItem, onAddItem, t }) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", number: "", variant: "" });
  const [saving, setSaving] = useState(false);

  const owned = items.filter((i) => i.owned).length;
  const isComplete = items.length > 0 && owned === items.length;

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      await onAddItem({ ...form, series });
      setForm({ name: "", number: "", variant: "" });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-400";

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-3">
      {/* Series header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
      >
        <span className="text-lg">{open ? "▾" : "▸"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-800 dark:text-gray-100">{series}</span>
            {isComplete && (
              <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                {t.catalog.complete}
              </span>
            )}
          </div>
          <ProgressBar value={owned} max={items.length} />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
          {t.catalog.progress(owned, items.length)}
        </span>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 px-4 py-3 italic">
              Nenhum item ainda.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-2 text-left w-10">{t.catalog.tableNumber}</th>
                  <th className="px-4 py-2 text-left">{t.catalog.tableName}</th>
                  <th className="px-4 py-2 text-left hidden sm:table-cell">{t.catalog.tableVariant}</th>
                  <th className="px-4 py-2 text-center w-24">{t.catalog.tableStatus}</th>
                  <th className="px-2 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`border-t border-gray-100 dark:border-gray-700/50 ${
                      idx % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50/50 dark:bg-gray-800/50"
                    }`}
                  >
                    <td className="px-4 py-2 text-gray-400 dark:text-gray-500 font-mono text-xs">
                      {item.number || "—"}
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">
                      {item.name}
                    </td>
                    <td className="px-4 py-2 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {item.variant || "—"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {item.owned ? (
                        <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
                          ✓ {t.catalog.owned}
                        </span>
                      ) : (
                        <span className="inline-block bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">
                          ✗ {t.catalog.notOwned}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors text-xs"
                        title={t.catalog.confirmDeleteItem}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Add item form */}
          {showForm ? (
            <form
              onSubmit={handleAdd}
              className="flex flex-wrap gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-t border-indigo-100 dark:border-indigo-800"
            >
              <input
                type="text"
                placeholder={t.catalog.itemNamePlaceholder}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`${inputCls} flex-1 min-w-32`}
                autoFocus
              />
              <input
                type="text"
                placeholder={t.catalog.itemNumber}
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                className={`${inputCls} w-16`}
              />
              <input
                type="text"
                placeholder={t.catalog.itemVariantPlaceholder}
                value={form.variant}
                onChange={(e) => setForm({ ...form, variant: e.target.value })}
                className={`${inputCls} w-36`}
              />
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saving ? t.catalog.saving : t.catalog.saveItem}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 dark:text-gray-400 text-xs px-2 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {t.catalog.cancel}
              </button>
            </form>
          ) : (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setShowForm(true)}
                className="text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:underline"
              >
                {t.catalog.addItem}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Catalog({ onCollectionChange }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSeries, setShowNewSeries] = useState(false);
  const [newSeries, setNewSeries] = useState({ name: "", category: "funko_pop" });
  const [savingSeries, setSavingSeries] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await get("/catalog");
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAddItem(itemData) {
    await post("/catalog", {
      series: itemData.series,
      name: itemData.name,
      number: itemData.number || null,
      variant: itemData.variant || null,
      category: newSeries.category || "funko_pop",
    });
    await load();
    onCollectionChange?.();
  }

  async function handleDeleteItem(id) {
    if (!confirm(t.catalog.confirmDeleteItem)) return;
    await del(`/catalog/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
    onCollectionChange?.();
  }

  async function handleCreateSeries(e) {
    e.preventDefault();
    if (!newSeries.name) return;
    setSavingSeries(true);
    try {
      // Create the series with a placeholder entry so it shows up
      await post("/catalog", {
        series: newSeries.name,
        name: "—",
        category: newSeries.category,
      });
      setNewSeries({ name: "", category: "funko_pop" });
      setShowNewSeries(false);
      await load();
    } finally {
      setSavingSeries(false);
    }
  }

  // Group by series
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.series]) acc[item.series] = [];
    acc[item.series].push(item);
    return acc;
  }, {});

  const inputCls =
    "border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.catalog.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t.catalog.subtitle}</p>
        </div>
        <button
          onClick={() => setShowNewSeries((s) => !s)}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          {t.catalog.addSeries}
        </button>
      </div>

      {/* Stats bar */}
      {!loading && Object.keys(grouped).length > 0 && (
        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mb-6 mt-3">
          <span>{Object.keys(grouped).length} {t.tabs.catalog.toLowerCase()}</span>
          <span>·</span>
          <span>{items.length} itens</span>
          <span>·</span>
          <span>{items.filter((i) => i.owned).length} {t.catalog.owned.toLowerCase()}</span>
        </div>
      )}

      {/* New series form */}
      {showNewSeries && (
        <form
          onSubmit={handleCreateSeries}
          className="flex gap-3 items-end bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 mb-6"
        >
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t.catalog.seriesName}
            </label>
            <input
              type="text"
              placeholder={t.catalog.seriesNamePlaceholder}
              value={newSeries.name}
              onChange={(e) => setNewSeries({ ...newSeries, name: e.target.value })}
              className={inputCls}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t.catalog.category}
            </label>
            <select
              value={newSeries.category}
              onChange={(e) => setNewSeries({ ...newSeries, category: e.target.value })}
              className={inputCls}
            >
              {Object.entries(t.catalog.categories).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={savingSeries}
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {savingSeries ? t.catalog.saving : t.catalog.saveSeries}
          </button>
          <button
            type="button"
            onClick={() => setShowNewSeries(false)}
            className="text-gray-500 dark:text-gray-400 text-sm px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {t.catalog.cancel}
          </button>
        </form>
      )}

      {/* Series list */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">{t.catalog.loading}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📚</p>
          <p className="text-gray-500 dark:text-gray-400">{t.catalog.empty}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([series, seriesItems]) => (
          <SeriesPanel
            key={series}
            series={series}
            items={seriesItems}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            t={t}
          />
        ))
      )}
    </div>
  );
}
