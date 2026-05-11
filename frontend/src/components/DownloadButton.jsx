import React from 'react';
import { Download, Loader2 } from 'lucide-react';

export default function DownloadButton({ onClick, loading, disabled, format }) {
  const label = format === 'mp3' ? 'Download MP3' : 'Download MP4';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="btn-primary w-full h-12 text-base relative overflow-hidden group"
    >
      {/* Shimmer effect on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Preparing download...</span>
        </>
      ) : (
        <>
          <Download size={18} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
