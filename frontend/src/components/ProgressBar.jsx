import React from 'react';

export default function ProgressBar({ progress, label }) {
  const isIndeterminate = progress === -1;

  return (
    <div className="w-full animate-fade-in">
      {/* Label row */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{label || 'Downloading...'}</span>
        {!isIndeterminate && (
          <span className="text-sm font-mono text-red-400">{progress}%</span>
        )}
      </div>

      {/* Track */}
      <div className="w-full h-2 bg-[#252525] rounded-full overflow-hidden">
        {isIndeterminate ? (
          // Indeterminate animation
          <div className="h-full w-1/3 bg-gradient-to-r from-red-700 via-red-500 to-red-700 rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]" />
        ) : (
          // Determinate bar
          <div
            className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.max(2, progress)}%` }}
          />
        )}
      </div>

      {isIndeterminate && (
        <p className="mt-1.5 text-xs text-gray-600 text-center">
          Processing on server — this may take a moment...
        </p>
      )}

      <style>{`
        @keyframes indeterminate {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
