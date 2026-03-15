import { useState } from "react";
import PhotoUpload from "../components/PhotoUpload";
import { postForm } from "../api";

export default function AddItem({ onAdded }) {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("ai"); // "ai" | "manual"

  // Campos manuais
  const [manual, setManual] = useState({
    ai_series: "", ai_name: "", ai_number: "", ai_variant: "", ai_category: "funko_pop",
  });

  async function handleSubmitAI(e) {
    e.preventDefault();
    if (!frontFile) { setError("Selecione ao menos a foto da frente."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("front", frontFile);
      if (backFile) fd.append("back", backFile);
      if (notes) fd.append("notes", notes);
      const item = await postForm("/collection/identify", fd);
      setResult(item);
      onAdded?.();
    } catch (err) {
      setError("Erro ao identificar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitManual(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      Object.entries(manual).forEach(([k, v]) => v && fd.append(k, v));
      if (notes) fd.append("notes", notes);
      if (frontFile) fd.append("front", frontFile);
      if (backFile) fd.append("back", backFile);
      const item = await postForm("/collection/manual", fd);
      setResult(item);
      onAdded?.();
    } catch (err) {
      setError("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Item</h2>

      {/* Toggle */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
        {["ai", "manual"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === m ? "bg-white shadow text-indigo-700" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m === "ai" ? "🤖 Identificar por foto (IA)" : "✏️ Cadastro manual"}
          </button>
        ))}
      </div>

      <form onSubmit={mode === "ai" ? handleSubmitAI : handleSubmitManual} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <PhotoUpload label="Frente *" name="front" onChange={setFrontFile} />
          <PhotoUpload label="Verso / Caixa" name="back" onChange={setBackFile} />
        </div>

        {mode === "manual" && (
          <div className="space-y-3">
            {[
              ["Série", "ai_series", "Marvel, Star Wars..."],
              ["Nome", "ai_name", "Spider-Man, Darth Vader..."],
              ["Número", "ai_number", "01, 45..."],
              ["Variante", "ai_variant", "Glow in the Dark..."],
            ].map(([label, key, placeholder]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={manual[key]}
                  onChange={(e) => setManual({ ...manual, [key]: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={manual.ai_category}
                onChange={(e) => setManual({ ...manual, ai_category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="funko_pop">Funko Pop</option>
                <option value="action_figure">Action Figure</option>
                <option value="vinyl">Vinyl</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Estado, edição limitada, local de compra..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Processando..." : mode === "ai" ? "Identificar e Salvar" : "Salvar"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-700 font-semibold mb-2">✓ Item salvo!</p>
          <p className="text-sm text-gray-700">
            <strong>{result.ai_name}</strong>
            {result.ai_series && ` — ${result.ai_series}`}
            {result.ai_number && ` #${result.ai_number}`}
          </p>
          {result.ai_confidence !== null && result.ai_confidence !== undefined && (
            <p className="text-xs text-gray-500 mt-1">
              Confiança da IA: {Math.round(result.ai_confidence * 100)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
}
