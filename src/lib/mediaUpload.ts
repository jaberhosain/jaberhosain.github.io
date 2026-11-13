import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Resizes an image file using an HTML5 Canvas to a maximum dimension of 1600px
 * and exports as WebP (or JPEG fallback) at ~0.8 quality.
 * Returns a Blob ready for upload.
 */
async function compressImageToBlob(file: File): Promise<{ blob: Blob; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        try {
          const MAX_DIM = 1600;
          let width = img.width;
          let height = img.height;

          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('HTML Canvas context unavailable.'));
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Test WebP support, fallback to JPEG
          const isWebpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
          const targetMime = isWebpSupported ? 'image/webp' : 'image/jpeg';
          const quality = 0.8;

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error('Canvas to Blob conversion failed.'));
              }
              resolve({ blob, mimeType: targetMime });
            },
            targetMime,
            quality
          );
        } catch (err: any) {
          reject(new Error('Image compression error: ' + (err.message || String(err))));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image or video file directly to Firebase Storage.
 * - Compresses images to max 1600px (WebP/JPEG, quality 0.8).
 * - Uploads videos directly up to 25MB.
 * - Tracks progress (0 - 100%).
 * - Returns the persistent public download URL.
 * - NEVER returns or falls back to base64 data URLs.
 */
export async function uploadMediaToStorage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 25MB limit.`);
  }

  const cleanName = (file.name || 'media')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 40);

  let uploadBlob: Blob;
  let contentType: string;
  let fileExt = '';

  if (file.type.startsWith('image/')) {
    onProgress?.(10);
    const compressed = await compressImageToBlob(file);
    uploadBlob = compressed.blob;
    contentType = compressed.mimeType;
    fileExt = contentType === 'image/webp' ? '.webp' : '.jpg';
    onProgress?.(30);
  } else if (file.type.startsWith('video/')) {
    uploadBlob = file;
    contentType = file.type;
    fileExt = cleanName.includes('.') ? '' : '.mp4';
    onProgress?.(15);
  } else {
    // Other media types (gif, svg, etc.)
    uploadBlob = file;
    contentType = file.type || 'application/octet-stream';
  }

  const storagePath = `portfolio_uploads/${Date.now()}_${cleanName}${fileExt}`;
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, uploadBlob, { contentType });

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress?.(pct);
        }
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(
          new Error(
            `Firebase Storage upload failed: ${error.message}. Please verify owner login.`
          )
        );
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          if (!downloadUrl || !downloadUrl.startsWith('http')) {
            throw new Error('Received invalid download URL from Firebase Storage.');
          }
          onProgress?.(100);
          resolve(downloadUrl);
        } catch (urlErr: any) {
          reject(new Error('Failed to retrieve download URL: ' + urlErr.message));
        }
      }
    );
  });
}
