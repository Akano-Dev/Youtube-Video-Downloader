import React from 'react';
import { Film, Music } from 'lucide-react';

const FORMATS = [
  { id: 'mp4', label: 'MP4 Video', icon: Film, desc: 'Video with audio' },
  { id: 'mp3', label: 'MP3 Audio', icon: Music, desc: 'Audio only' },
];

export default function FormatSelector({ selected, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        Format
      </label>
      <div className="flex gap-3">
        {FORMATS.map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`format-btn ${selected === id ? 'format-btn-active' : 'format-btn-inactive'}`}
          >
            <Icon size={16} />
            <div className="text-left">
              <div className="font-semibold text-sm">{label}</div>
              <div className="text-xs opacity-60">{desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
