import React, { useState } from 'react';
import { Link, X, Search } from 'lucide-react';

export default function UrlInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed);
  }

  function handleClear() {
    setUrl('');
  }
  function handlePaste(e) {
    // Auto-submit on paste if it looks like a YouTube URL
    // Use setTimeout to let the input value update first
    setTimeout(() => {
      const pasted = e.target.value.trim();
      if (pasted.includes('youtube.com') || pasted.includes('youtu.be')) {
        // Clean up any duplicated URLs (e.g. if user pasted twice)
        const cleaned = pasted.split('https://').filter(Boolean);
        const finalUrl = cleaned.length > 1
          ? 'https://' + cleaned[cleaned.length - 1]
          : pasted;
        setUrl(finalUrl);
        onSubmit(finalUrl);
      }
    }, 10);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center gap-3">
        {/* Icon */}
        <div className="absolute left-4 text-gray-500 pointer-events-none">
          <Link size={18} />
        </div>

        {/* Input */}
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPaste={handlePaste}
          placeholder="Paste YouTube URL here..."
          className="input-field pl-11 pr-24 text-base h-14"
          disabled={loading}
          autoFocus
        />

        {/* Clear button */}
        {url && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-[5.5rem] text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!url.trim() || loading}
          className="absolute right-2 btn-primary py-2 px-4 text-sm h-10"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Fetching
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search size={15} />
              Fetch
            </span>
          )}
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-600 text-center">
        Supports youtube.com/watch, youtu.be, and YouTube Shorts
      </p>
    </form>
  );
}
