import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import { useLang } from "../context/LangContext";
import { get, del } from "../api";

export default function Collection() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await get("/collection");
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm(t.collection.confirmRemove)) return;
    await del(`/collection/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const filtered = filter
    ? items.filter((i) =>
        [i.ai_name, i.ai_series, i.ai_variant].some(
          (f) => f?.toLowerCase().includes(filter.toLowerCase())
        )
      )
    : items;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t.collection.title}
          <span className="ml-2 text-lg font-normal text-gray-400 dark:text-gray-500">
            ({items.length})
          </span>
        </h2>
        <input
          type="text"
          placeholder={t.collection.filter}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">{t.collection.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📦</p>
          <p className="text-gray-500 dark:text-gray-400">
            {filter ? t.collection.emptyFilter : t.collection.empty}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
