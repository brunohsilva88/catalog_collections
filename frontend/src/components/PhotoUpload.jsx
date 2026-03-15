import { useRef, useState } from "react";

export default function PhotoUpload({ label, name, onChange }) {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange(file);
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      <div
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors text-center bg-white dark:bg-gray-800"
      >
        {preview ? (
          <img src={preview} alt="preview" className="max-h-36 mx-auto rounded" />
        ) : (
          <div className="py-4 text-gray-400 dark:text-gray-500">
            <p className="text-2xl">📷</p>
            <p className="text-sm mt-1">Clique para selecionar</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
