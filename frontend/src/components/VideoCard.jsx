import React, { useState } from 'react';
import { Clock, Eye, User, Play } from 'lucide-react';

function formatViews(count) {
  if (!count) return null;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} views`;
}

export default function VideoCard({ info }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="glass-card p-4 animate-slide-up">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 w-40 h-24 rounded-xl overflow-hidden bg-[#252525] group">
          {!imgError && info.thumbnail ? (
            <img
              src={info.thumbnail}
              alt={info.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <Play size={28} />
            </div>
          )}
          {/* Duration badge */}
          {info.durationFormatted && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
              {info.durationFormatted}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">
            {info.title}
          </h3>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {info.uploader && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <User size={12} />
                {info.uploader}
              </span>
            )}
            {info.durationFormatted && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                {info.durationFormatted}
              </span>
            )}
            {info.viewCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Eye size={12} />
                {formatViews(info.viewCount)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
