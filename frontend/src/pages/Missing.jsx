import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import { get } from "../api";

export default function Missing() {
  const [items, setItems] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get("/series").then(setSeries).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const path = selectedSeries ? `/missing?series=${encodeURIComponent(selectedSeries)}` : "/missing";
    get(path)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [selectedSeries]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Faltando
          <span className="ml-2 text-lg font-normal text-gray-400">({items.length})</span>
        </h2>
        <select
          value={selectedSeries}
          onChange={(e) => setSelectedSeries(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Todas as séries</option>
          {series.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {series.length === 0 && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
          💡 Adicione itens ao catálogo de referência para ver o que está faltando na sua coleção.
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🎉</p>
          <p className="text-gray-500">
            {selectedSeries
              ? `Você tem todos os itens da série "${selectedSeries}"!`
              : "Nada faltando — catálogo vazio ou coleção completa!"}
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
