"use client";

import { useAudioPlayer } from "./providers/AudioPlayerProvider";
import Image from "next/image";
import Link from "next/link";

export default function AudioPlayerBar() {
  const { currentTrack, isPlaying, toggle, seek, progress, duration } = useAudioPlayer();

  if (!currentTrack) return null;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  const formatTime = (s: number) => {
    if (isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-2 py-1 z-50 mb-16">
      <div className="flex items-center gap-2 sm:gap-4 w-full">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center overflow-hidden">
          <Image src={currentTrack.cover} alt={currentTrack.title} width={32} height={32} className="w-full h-full object-cover rounded-lg" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
          <Link
            href={`/token/${currentTrack.id}`}
            className="font-medium text-white truncate hover:underline focus:underline cursor-pointer text-xs sm:text-sm"
          >
            {currentTrack.title}
          </Link>
          <span className="hidden sm:inline text-gray-500 mx-1">·</span>
          <Link
            href={`/profile/${encodeURIComponent(currentTrack.artist)}`}
            className="text-xs text-purple-300 hover:underline focus:underline truncate cursor-pointer"
          >
            {currentTrack.artist}
          </Link>
        </div>
        <button
          className="text-white bg-gray-700 hover:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center"
          onClick={() => toggle(currentTrack)}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <rect x="6" y="4" width="3" height="12" rx="1" />
              <rect x="11" y="4" width="3" height="12" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <polygon points="5,3 19,10 5,17" />
            </svg>
          )}
        </button>
        <div className="flex items-center gap-1 w-1/2 min-w-[60px]">
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={progress}
            onChange={handleSeek}
            className="flex-1 accent-purple-500 h-1"
            style={{ minWidth: 30 }}
          />
          <span className="text-[10px] text-gray-400 w-6 text-right">{formatTime(progress)}</span>
          <span className="text-[10px] text-gray-400 w-6 text-right">{formatTime(duration)}</span>
        </div>
      </div>
      {/* No separate mobile time display, both times are now together */}
    </div>
  );
} 