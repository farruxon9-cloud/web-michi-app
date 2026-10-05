// src/utils/licenseImage.js
// Browser-only: resize a licence photo to ≤1600px (longest side) JPEG and keep it ≤2 MB
// (the server rejects larger images). Pure math lives in trustHelpers (fitWithin, dataUrlBytes).
import { fitWithin, dataUrlBytes } from './trustHelpers';

export const LICENSE_IMAGE_MAX_PX = 1600;
export const LICENSE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(reader.error || new Error('read failed'));
  reader.readAsDataURL(file);
});

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('decode failed'));
  img.src = src;
});

/**
 * @param {File} file image chosen by the user
 * @returns {Promise<string>} data:image/jpeg;base64,… (≤1600px, ≤2 MB)
 */
export async function resizeLicenseImage(file, { maxPx = LICENSE_IMAGE_MAX_PX, maxBytes = LICENSE_IMAGE_MAX_BYTES } = {}) {
  if (!file || !String(file.type || '').startsWith('image/')) throw new Error('not_image');
  const img = await loadImage(await readAsDataUrl(file));
  let { width, height } = fitWithin(img.naturalWidth || img.width, img.naturalHeight || img.height, maxPx);
  if (!width || !height) throw new Error('decode failed');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let quality = 0.86;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const out = canvas.toDataURL('image/jpeg', quality);
    if (dataUrlBytes(out) <= maxBytes) return out;
    // Too big: lower quality first, then shrink the dimensions
    if (quality > 0.6) quality -= 0.12;
    else { width = Math.round(width * 0.8); height = Math.round(height * 0.8); }
  }
  throw new Error('too_large');
}
