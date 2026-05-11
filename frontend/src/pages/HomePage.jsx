import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import UrlInput from '../components/UrlInput';
import VideoCard from '../components/VideoCard';
import FormatSelector from '../components/FormatSelector';
import QualitySelector from '../components/QualitySelector';
import ProgressBar from '../components/ProgressBar';
import DownloadButton from '../components/DownloadButton';
import ErrorMessage from '../components/ErrorMessage';
import { fetchVideoInfo, downloadMedia } from '../api/downloader';

export default function HomePage() {
  const [videoInfo, setVideoInfo] = useState(null);
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('720');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');

  const handleFetch = useCallback(async (url) => {
    setError('');
    setVideoInfo(null);
    setFetchLoading(true);
    setCurrentUrl(url);

    try {
      const info = await fetchVideoInfo(url);
      setVideoInfo(info);

      // Auto-select best available quality
      if (info.availableQualities && info.availableQualities.length > 0) {
        const best = Math.max(...info.availableQualities);
        setQuality(String(best));
      }

      toast.success('Video info loaded!');
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!currentUrl) return;

    setError('');
    setDownloadLoading(true);
    setProgress(0);

    const toastId = toast.loading(
      format === 'mp3' ? 'Converting to MP3...' : `Downloading ${quality}p MP4...`
    );

    try {
      const { blobUrl, filename } = await downloadMedia(
        currentUrl,
        format,
        quality,
        (pct) => setProgress(pct)
      );

      // Trigger browser download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      toast.success('Download complete!', { id: toastId });
      setProgress(100);

      // Reset progress after a moment
      setTimeout(() => {
        setProgress(0);
        setDownloadLoading(false);
      }, 1500);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      toast.error(msg, { id: toastId });
      setDownloadLoading(false);
      setProgress(0);
    }
  }, [currentUrl, format, quality]);

  function handleFormatChange(newFormat) {
    setFormat(newFormat);
    setError('');
  }

  function handleQualityChange(newQuality) {
    setQuality(newQuality);
    setError('');
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-900/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative flex-1 flex flex-col items-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-xl">
          {/* Header */}
          <Header />

          {/* URL Input */}
          <div className="glass-card p-5 mb-4">
            <UrlInput onSubmit={handleFetch} loading={fetchLoading} />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} onDismiss={() => setError('')} />
            </div>
          )}

          {/* Video Info + Options */}
          {videoInfo && (
            <div className="space-y-4 animate-slide-up">
              {/* Video preview */}
              <VideoCard info={videoInfo} />

              {/* Options card */}
              <div className="glass-card p-5 space-y-5">
                {/* Format */}
                <FormatSelector selected={format} onChange={handleFormatChange} />

                {/* Quality — only for video */}
                {format === 'mp4' && (
                  <QualitySelector
                    selected={quality}
                    onChange={handleQualityChange}
                    availableQualities={videoInfo.availableQualities}
                    disabled={downloadLoading}
                  />
                )}

                {/* Divider */}
                <div className="border-t border-[#2a2a2a]" />

                {/* Progress */}
                {downloadLoading && (
                  <ProgressBar
                    progress={progress}
                    label={
                      format === 'mp3'
                        ? 'Converting to MP3...'
                        : `Downloading ${quality}p video...`
                    }
                  />
                )}

                {/* Download button */}
                <DownloadButton
                  onClick={handleDownload}
                  loading={downloadLoading}
                  disabled={fetchLoading}
                  format={format}
                />

                <p className="text-xs text-gray-600 text-center">
                  Files are processed on the server and deleted immediately after download.
                </p>
              </div>
            </div>
          )}

          {/* Empty state hint */}
          {!videoInfo && !fetchLoading && !error && (
            <div className="text-center mt-8 animate-fade-in">
              <div className="inline-flex flex-col items-center gap-2 text-gray-700">
                <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-2">
                  <span className="text-3xl">▶</span>
                </div>
                <p className="text-sm">Paste a YouTube link above to get started</p>
                <p className="text-xs text-gray-600">Supports videos, Shorts, and more</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative text-center py-6 text-xs text-gray-700 border-t border-[#1a1a1a]">
        For personal use only · Respect copyright laws
      </footer>
    </div>
  );
}

/**
 * Extract a human-readable error message from an Axios error or generic error
 */
function extractErrorMessage(err) {
  // Axios error with JSON response body
  if (err?.response?.data) {
    const data = err.response.data;
    if (typeof data === 'string' && data.length < 300) return data;
    if (data.error) return data.error;
    if (data.message) return data.message;
  }
  // Network error (backend not running)
  if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
    return 'Cannot connect to backend. The server may be starting up (Render free tier takes ~50s). Please try again.';
  }
  return err?.message || 'Something went wrong. Please try again.';
}
