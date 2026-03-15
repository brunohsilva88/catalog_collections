import { useLang } from "../context/LangContext";

export default function ItemCard({ item, onDelete, showDelete = true }) {
  const { t } = useLang();
  const name = item.ai_name || item.name || t.collection.unknown;
  const series = item.ai_series || item.series || "—";
  const number = item.ai_number || item.number;
  const variant = item.ai_variant || item.variant;
  const confidence = item.ai_confidence;
  const photoUrl = item.photo_front
    ? `http://localhost:8000/uploads/${item.photo_front.split("/uploads/")[1] || item.photo_front.split("/").pop()}`
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-40 object-cover"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
          <span className="text-4xl">🎭</span>
        </div>
      )}

      <div className="p-3">
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wide">{series}</p>
        <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight mt-0.5">{name}</h3>

        <div className="flex flex-wrap gap-1 mt-2">
          {number && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
              #{number}
            </span>
          )}
          {variant && (
            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
              {variant}
            </span>
          )}
          {confidence !== undefined && confidence !== null && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              confidence >= 0.8
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : confidence >= 0.5
                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
            }`}>
              {Math.round(confidence * 100)}% {t.add.confidence.split(" ")[1] || ""}
            </span>
          )}
          {item.owned === true && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
              ✓ {t.catalog.owned.toLowerCase()}
            </span>
          )}
          {item.owned === false && (
            <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
              ✗ {t.catalog.notOwned.toLowerCase()}
            </span>
          )}
        </div>

        {item.notes && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{item.notes}</p>
        )}

        {showDelete && onDelete && (
          <button
            onClick={() => onDelete(item.id)}
            className="mt-3 w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 py-1 rounded transition-colors"
          >
            {t.collection.remove}
          </button>
        )}
      </div>
    </div>
  );
}
