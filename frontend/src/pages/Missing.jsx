import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import { useLang } from "../context/LangContext";
import { get } from "../api";

export default function Missing() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get("/series").then(setSeries).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const path = selectedSeries
      ? `/missing?series=${encodeURIComponent(selectedSeries)}`
      : "/missing";
    get(path).then(setItems).finally(() => setLoading(false));
  }, [selectedSeries]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t.missing.title}
          <span className="ml-2 text-lg font-normal text-gray-400 dark:text-gray-500">
            ({items.length})
          </span>
        </h2>
        <select
          value={selectedSeries}
          onChange={(e) => setSelectedSeries(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">{t.missing.allSeries}</option>
          {series.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {series.length === 0 && !loading && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6 text-sm text-yellow-800 dark:text-yellow-300">
          💡 {t.missing.tip}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">{t.missing.loading}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🎉</p>
          <p className="text-gray-500 dark:text-gray-400">
            {selectedSeries ? t.missing.emptySeries(selectedSeries) : t.missing.emptyAll}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={{ ...item, owned: false }} showDelete={false} />
          ))}
        </div>
      )}
    </div>
  );
}
