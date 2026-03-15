import { useState } from "react";
import PhotoUpload from "../components/PhotoUpload";
import { useLang } from "../context/LangContext";
import { postForm } from "../api";

export default function AddItem({ onAdded }) {
  const { t } = useLang();
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("ai");

  const [manual, setManual] = useState({
    ai_series: "", ai_name: "", ai_number: "", ai_variant: "", ai_category: "funko_pop",
  });

  async function handleSubmitAI(e) {
    e.preventDefault();
    if (!frontFile) { setError(t.add.errorFront); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const fd = new FormData();
      fd.append("front", frontFile);
      if (backFile) fd.append("back", backFile);
      if (notes) fd.append("notes", notes);
      const item = await postForm("/collection/identify", fd);
      setResult(item);
      onAdded?.();
    } catch (err) {
      setError(`${t.add.errorAI} ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitManual(e) {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
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
      setError(`${t.add.errorSave} ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t.add.title}</h2>

      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-6">
        {["ai", "manual"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === m
                ? "bg-white dark:bg-gray-800 shadow text-indigo-700 dark:text-indigo-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {m === "ai" ? t.add.aiMode : t.add.manualMode}
          </button>
        ))}
      </div>

      <form onSubmit={mode === "ai" ? handleSubmitAI : handleSubmitManual} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <PhotoUpload label={t.add.front} name="front" onChange={setFrontFile} />
          <PhotoUpload label={t.add.back}  name="back"  onChange={setBackFile}  />
        </div>

        {mode === "manual" && (
          <div className="space-y-3">
            {[
              [t.add.series,  "ai_series",  "Marvel, Star Wars..."],
              [t.add.name,    "ai_name",    "Spider-Man..."],
              [t.add.number,  "ai_number",  "01, 45..."],
              [t.add.variant, "ai_variant", t.add.variant + "..."],
            ].map(([label, key, placeholder]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={manual[key]}
                  onChange={(e) => setManual({ ...manual, [key]: e.target.value })}
                  className={inputCls}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.add.category}</label>
              <select
                value={manual.ai_category}
                onChange={(e) => setManual({ ...manual, ai_category: e.target.value })}
                className={inputCls}
              >
                {Object.entries(t.add.categories).map(([v, label]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.add.notes}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder={t.add.notesPlaceholder}
            className={inputCls}
          />
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? t.add.processing : mode === "ai" ? t.add.submit : t.add.submitManual}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
          <p className="text-green-700 dark:text-green-400 font-semibold mb-2">{t.add.saved}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>{result.ai_name}</strong>
            {result.ai_series && ` — ${result.ai_series}`}
            {result.ai_number && ` #${result.ai_number}`}
          </p>
          {result.ai_confidence != null && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t.add.confidence}: {Math.round(result.ai_confidence * 100)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
}
