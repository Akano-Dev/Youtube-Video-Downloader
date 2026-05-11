import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

/**
 * Fetch video metadata
 * @param {string} url - YouTube URL
 * @returns {Promise<Object>} Video info
 */
export async function fetchVideoInfo(url) {
  const response = await api.post('/info', { url });
  return response.data;
}

/**
 * Download video/audio — returns a blob URL for the browser to download
 * @param {string} url - YouTube URL
 * @param {string} format - 'mp4' or 'mp3'
 * @param {string} quality - '360', '720', or '1080'
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{blobUrl: string, filename: string}>}
 */
export async function downloadMedia(url, format, quality, onProgress) {
  const response = await api.post(
    '/download',
    { url, format, quality },
    {
      responseType: 'blob',
      timeout: 600000, // 10 minutes for large files
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onProgress?.(percent);
        } else {
          // No content-length header — simulate indeterminate progress
          onProgress?.(-1);
        }
      },
    }
  );

  // Extract filename from Content-Disposition header
  const disposition = response.headers['content-disposition'] || '';
  let filename = `download.${format}`;
  const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (match && match[1]) {
    filename = decodeURIComponent(match[1].replace(/['"]/g, ''));
  }

  const blobUrl = URL.createObjectURL(response.data);
  return { blobUrl, filename };
}
