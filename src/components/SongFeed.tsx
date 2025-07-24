"use client";

import { useState } from "react";
import Image from "next/image";
import TradeModal from "./home/TradeModal";
import { featuredTracks, type Track } from "~/lib/tracks";
import { useAudioPlayer } from "./providers/AudioPlayerProvider";

const mockTracks: Track[] = [
  {
    id: "1",
    title: "Orange Peel",
    artist: "Reidenshi",
    album: "Ambient Collection",
    genre: "Ambient",
    cover: "/placeholders/1.jpg",
    isPlaying: false,
    mcap: "$1.2M",
    vol24h: "$120K",
  },
  {
    id: "2",
    title: "Snowfall",
    artist: "Oneheart, Reidenshi",
    album: "Easy Listening",
    genre: "Ambient",
    cover: "/placeholders/2.jpg",
    isPlaying: false,
    mcap: "$2.5M",
    vol24h: "$250K",
  },
  {
    id: "3",
    title: "Orange Peel",
    artist: "Oneheart",
    album: "Ambient Collection",
    genre: "Ambient",
    cover: "/placeholders/3.jpg",
    isPlaying: true,
    mcap: "$1.2M",
    vol24h: "$120K",
  },
  {
    id: "4",
    title: "Bonjr",
    artist: "Oneheart",
    album: "Ambient Collection",
    genre: "Ambient",
    cover: "/placeholders/4.jpg",
    isPlaying: false,
    mcap: "$800K",
    vol24h: "$80K",
  },
];

// Note: featuredTracks is now imported from ~/lib/tracks

const genres = ["Ambient", "Lo-fi", "Synthwave", "Chillhop", "Downtempo"];

function FeaturedSongs({ tracks, onTrackClick }: { tracks: Track[]; onTrackClick: (trackId: string) => void }) {
  const { currentTrack, isPlaying, toggle } = useAudioPlayer();

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Featured Songs</h3>
      <div className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4">
        {tracks.map((track) => {
          const isTrackPlaying = currentTrack && currentTrack.id === track.id && isPlaying;
          return (
            <div
              key={track.id}
              className="flex-shrink-0 bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors flex gap-4 cursor-pointer group"
              style={{ minWidth: '300px' }}
            >
              {/* Track Image - First Column */}
              <div
                className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg overflow-hidden flex-shrink-0 relative"
                onClick={() => toggle(track)}
                style={{ cursor: 'pointer' }}
              >
                <Image 
                  src={track.cover} 
                  alt={track.title} 
                  width={120} 
                  height={120} 
                  className="w-full h-full object-cover"
                />
                {/* Play/Pause Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {isTrackPlaying ? (
                    // Pause icon
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="5" y="4" width="3" height="12" rx="1" />
                      <rect x="12" y="4" width="3" height="12" rx="1" />
                    </svg>
                  ) : (
                    // Play icon
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <polygon points="6,4 16,10 6,16" />
                    </svg>
                  )}
                </div>
              </div>
              {/* Track Info - Second Column, links to token page */}
              <div
                className="flex-1 space-y-2 min-w-0"
                onClick={() => onTrackClick(track.id)}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <h4 className="font-medium text-white text-md truncate">{track.title}</h4>
                  <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                </div>
                {/* Stats */}
                <div className="space-y-1">
                  <div className="text-xs">
                    <span className="text-gray-400">market cap: </span>
                    <span className="text-green-400 font-medium">{track.mcap}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-400">Vol 24hs: </span>
                    <span className="text-white font-medium">{track.vol24h}</span>
                  </div>
                  <div className="pt-1">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
                      {track.genre}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SongFeed() {
  const [selectedGenre, setSelectedGenre] = useState("Ambient");
  const [tracks] = useState(mockTracks);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [tradeModalTrack, setTradeModalTrack] = useState<Track | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const { toggle } = useAudioPlayer();

  const togglePlay = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) toggle(track);
  };

  const toggleInfo = (trackId: string) => {
    setExpandedTrackId(prev => (prev === trackId ? null : trackId));
  };

  const handleTrackClick = (trackId: string) => {
    // Navigate to the token page
    window.location.href = `/token/${trackId}`;
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      
      {/* Content Header */}
      <div className="p-4 pt-4">
        <div className="flex items-center mb-6">
          <div className="text-2xl font-bold">
            Listen,<br />
            Explore <span className="text-white">and<br />Trade Records</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Image src="/waves.gif" alt="Waves" width={144} height={90} className="object-contain" unoptimized />
          </div>
        </div>

        {/* Featured Songs Section */}
        <FeaturedSongs tracks={featuredTracks} onTrackClick={handleTrackClick} />

        {/* Genre Selector */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Genre:</div>
          <select 
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg w-full appearance-none border border-gray-700 focus:border-gray-500 focus:outline-none"
          >
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 px-4 pb-24">
        {tracks.filter(track => track.genre === selectedGenre).map((track) => (
          <div key={track.id} className="mb-4">
            <div className="flex items-center p-3 rounded-lg bg-gray-900/50">
              {/* Play Button */}
              <button
                onClick={() => togglePlay(track.id)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3 hover:bg-white/20 transition-colors"
              >
                {track.isPlaying ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Album Art */}
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg mr-3 flex items-center justify-center overflow-hidden">
                <Image src={track.cover} alt={track.title} width={48} height={48} className="w-full h-full object-cover rounded-lg" />
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{track.title}</div>
                <div className="text-sm text-gray-400 truncate">{track.artist}</div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-2">
                <button
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={() => toggleInfo(track.id)}
                >
                  <span className="text-xs">Info</span>
                  <span className="ml-1">
                    {expandedTrackId === track.id ? (
                      <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 12.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 9.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    )}
                  </span>
                </button>
              </div>
            </div>
            {/* Expanded Info Section */}
            {expandedTrackId === track.id && (
              <div className="bg-gray-900/80 rounded-b-lg px-3 py-4 flex flex-row gap-8 text-sm border-t border-gray-800">
                {/* Left column */}
                <div className="flex-1 min-w-0 ml-16">
                  <div className="text-gray-400 mb-1">Artist Name</div>
                  <div className="text-white mb-3">{track.artist}</div>
                  <div className="text-gray-400 mb-1">Genre</div>
                  <div className="text-white">{track.genre}</div>
                </div>
                {/* Right column */}
                <div className="flex-1 min-w-0 flex flex-col ml-16 items-end">
                  <div className="flex flex-col items-end">
                    <div className="text-gray-400 mb-1">MCAP</div>
                    <div className="text-white mb-3">{track.mcap}</div>
                    <div className="text-gray-400 mb-1">24h Vol</div>
                    <div className="text-white">{track.vol24h}</div>
                  </div>
                  <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors self-end" onClick={() => setTradeModalTrack(track)}>Trade</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <TradeModal
        open={!!tradeModalTrack}
        onClose={() => setTradeModalTrack(null)}
        tradeType={tradeType}
        setTradeType={setTradeType}
        tradeAmount={tradeAmount}
        setTradeAmount={setTradeAmount}
        ethBalance={"0"}
      />
    </div>
  );
}