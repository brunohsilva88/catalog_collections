import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import { get, post, del } from "../api";

export default function Catalog() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ series: "", name: "", number: "", variant: "", category: "funko_pop" });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

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

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.series || !form.name) return;
    setAdding(true);
    try {
      await post("/catalog", form);
      setForm({ series: "", name: "", number: "", variant: "", category: "funko_pop" });
      setShowForm(false);
      load();
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remover do catálogo?")) return;
    await del(`/catalog/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  // Agrupar por série
  const grouped = items.reduce((acc, item) => {
    const s = item.series || "Outros";
    if (!acc[s]) acc[s] = [];
    acc[s].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Catálogo de Referência
          <span className="ml-2 text-lg font-normal text-gray-400">({items.length})</span>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Adicionar ao catálogo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3">
          {[
            ["Série *", "series", "Marvel, Star Wars..."],
            ["Nome *", "name", "Spider-Man..."],
            ["Número", "number", "01, 45..."],
            ["Variante", "variant", "Glow in the Dark..."],
          ].map(([label, key, placeholder]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="funko_pop">Funko Pop</option>
              <option value="action_figure">Action Figure</option>
              <option value="vinyl">Vinyl</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={adding}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {adding ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-500 text-sm px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📚</p>
          <p className="text-gray-500">Catálogo vazio. Adicione itens para rastrear o que falta.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([series, seriesItems]) => (
          <div key={series} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
              {series}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({seriesItems.filter(i => i.owned).length}/{seriesItems.length})
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {seriesItems.map((item) => (
                <ItemCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
