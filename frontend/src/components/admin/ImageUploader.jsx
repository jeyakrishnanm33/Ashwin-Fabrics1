// src/components/admin/ImageUploader.jsx
import { useState, useRef } from 'react';
import { FiUploadCloud, FiX, FiImage, FiCheck } from 'react-icons/fi';
import { uploadMultiple } from '@utils/cloudinary';

/**
 * ImageUploader — drag & drop multi-image uploader for admin
 * Props:
 *   value: string[]         — current image URLs
 *   onChange: (urls) => {}  — called with updated URL array
 *   maxImages: number       — default 5
 */
export default function ImageUploader({ value = [], onChange, maxImages = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!fileArr.length) return;

    const remaining = maxImages - value.length;
    if (remaining <= 0) { setError(`Max ${maxImages} images allowed`); return; }

    const toUpload = fileArr.slice(0, remaining);
    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const newUrls = await uploadMultiple(toUpload, 'fashionflow/products', setProgress);
      onChange([...value, ...newUrls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeImage = (idx) => {
    const updated = value.filter((_, i) => i !== idx);
    onChange(updated);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((url, i) => (
            <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
              {/* Order badge */}
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-gray-900/70 text-white py-0.5">
                  Main
                </span>
              )}
              {/* Remove button */}
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full 
                  opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
              >
                <FiX size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {value.length < maxImages && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition
            ${dragging ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}
            ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
              <p className="text-sm font-semibold text-gray-700">Uploading... {progress}%</p>
              <div className="w-40 bg-gray-200 rounded-full h-1.5">
                <div className="bg-gray-900 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <FiUploadCloud size={22} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {dragging ? 'Drop images here' : 'Click or drag images to upload'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  PNG, JPG, WEBP up to 10MB · {value.length}/{maxImages} uploaded
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tip */}
      {value.length > 1 && (
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <FiImage size={11} /> First image is the main display image
        </p>
      )}

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
