import React from 'react';
import { Youtube } from 'lucide-react';

export default function Header() {
  return (
    <header className="text-center mb-10">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/30">
          <Youtube size={26} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          YT<span className="text-red-500">Downloader</span>
        </h1>
      </div>

      <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
        Download YouTube videos and audio for personal use.
        Paste a URL below to get started.
      </p>

      {/* Personal use badge */}
      <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        <span className="text-xs text-yellow-500/80 font-medium">Personal use only</span>
      </div>
    </header>
  );
}
