// src/utils/cloudinary.js
// Direct browser → Cloudinary upload (no backend needed for unsigned uploads)

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload one file to Cloudinary
 * Returns the secure URL string
 */
export async function uploadToCloudinary(file, folder = 'fashionflow/products') {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary env vars not set. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to frontend/.env');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Upload failed');
  }

  const data = await res.json();
  return data.secure_url;
}

/**
 * Upload multiple files, returns array of URLs
 */
export async function uploadMultiple(files, folder = 'fashionflow/products', onProgress) {
  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const url = await uploadToCloudinary(files[i], folder);
    urls.push(url);
    onProgress?.(Math.round(((i + 1) / files.length) * 100));
  }
  return urls;
}
