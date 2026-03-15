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
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      <div
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-indigo-400 transition-colors text-center"
      >
        {preview ? (
          <img src={preview} alt="preview" className="max-h-36 mx-auto rounded" />
        ) : (
          <div className="py-4 text-gray-400">
            <p className="text-2xl">📷</p>
            <p className="text-sm mt-1">Clique para selecionar foto</p>
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
