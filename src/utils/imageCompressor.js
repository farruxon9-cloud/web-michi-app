/**
 * Client-side image compression utility using HTML Canvas.
 * Compresses an image file and returns a Promise resolving to a compressed base64 string.
 * This keeps images small, reduces application overhead, and keeps loading times fast.
 * 
 * @param {File} file - The file object from input type="file"
 * @param {number} maxWidth - Maximum allowed width of the compressed image
 * @param {number} maxHeight - Maximum allowed height of the compressed image
 * @param {number} quality - Quality compression factor (0.0 to 1.0)
 * @returns {Promise<string>} - Resolves to the compressed base64 JPEG string
 */
export function compressImage(file, maxWidth = 600, maxHeight = 600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid file type. Only images are supported.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Enable high-quality image scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);

        // Compress and convert to base64 JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
