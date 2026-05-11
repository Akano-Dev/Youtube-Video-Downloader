import React from 'react';
import { Zap } from 'lucide-react';

const ALL_QUALITIES = [
  { id: '360', label: '360p', desc: 'Low' },
  { id: '720', label: '720p', desc: 'HD' },
  { id: '1080', label: '1080p', desc: 'Full HD' },
];

export default function QualitySelector({ selected, onChange, availableQualities, disabled }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        Quality
      </label>
      <div className="flex gap-2 flex-wrap">
        {ALL_QUALITIES.map(({ id, label, desc }) => {
          const isAvailable = !availableQualities || availableQualities.length === 0 || availableQualities.includes(Number(id));
          const isSelected = selected === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => !disabled && isAvailable && onChange(id)}
              disabled={disabled || !isAvailable}
              title={!isAvailable ? 'Not available for this video' : `${label} ${desc}`}
              className={`quality-btn transition-all duration-200 ${
                isSelected
                  ? 'quality-btn-active'
                  : isAvailable
                  ? 'quality-btn-inactive'
                  : 'opacity-30 cursor-not-allowed bg-[#1a1a1a] border-[#2a2a2a] text-gray-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {isSelected && <Zap size={12} className="text-red-400" />}
                <span>{label}</span>
                <span className="text-xs opacity-60">{desc}</span>
              </span>
            </button>
          );
        })}
      </div>
      {availableQualities && availableQualities.length > 0 && (
        <p className="mt-1.5 text-xs text-gray-600">
          Available: {availableQualities.map(q => `${q}p`).join(', ')}
        </p>
      )}
    </div>
  );
}
