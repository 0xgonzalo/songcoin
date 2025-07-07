"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useZoraEvents } from '~/hooks/useZoraEvents';
import { useAudioPlayer } from '~/components/providers/AudioPlayerProvider';
import MusicCoinCard from '~/components/MusicCoinCard';
import { featuredTracks } from '~/lib/tracks';
import { Loader2, Music, TrendingUp, Users, Coins } from 'lucide-react';

// Genre filter options
const genres = ["All", "Electronic", "Hip Hop", "Rock", "Pop", "Ambient", "Other"];

export default function HomePage() {
  const { coins, loading, error, progressMessage, refreshCoins } = useZoraEvents();
  const { currentTrack, isPlaying, toggle } = useAudioPlayer();
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [showOnlyWithAudio, setShowOnlyWithAudio] = useState(false);

  // Filter coins based on selected genre and audio availability
  const filteredCoins = coins.filter(coin => {
    const genreMatch = selectedGenre === "All" || 
      (coin.metadata?.attributes?.find((attr: any) => attr.trait_type === 'Genre')?.value === selectedGenre);
    const audioMatch = !showOnlyWithAudio || coin.audioUrl;
    return genreMatch && audioMatch;
  });

  // Stats calculations
  const totalCoins = coins.length;
  const coinsWithAudio = coins.filter(coin => coin.audioUrl).length;
  const uniqueArtists = new Set(coins.map(coin => coin.artistAddress)).size;

  const handleTrackClick = (coinAddress: string) => {
    window.location.href = `/token/${coinAddress}`;
  };

  // Featured Songs Section using existing featured tracks
  const FeaturedSongs = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Featured Songs</h3>
      <div className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4">
        {featuredTracks.map((track) => {
          const isTrackPlaying = currentTrack && currentTrack.id === track.id && isPlaying;
          return (
            <div
              key={track.id}
              className="flex-shrink-0 bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors flex gap-4 cursor-pointer group"
              style={{ minWidth: '300px' }}
            >
              {/* Track Image */}
              <div
                className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg overflow-hidden flex-shrink-0 relative"
                onClick={() => toggle(track)}
                style={{ cursor: 'pointer' }}
              >
                <Image 
                  src={track.cover} 
                  alt={track.title} 
                  width={128} 
                  height={128} 
                  className="w-full h-full object-cover"
                />
                {/* Play/Pause Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isTrackPlaying ? (
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="5" y="4" width="3" height="12" rx="1" />
                      <rect x="12" y="4" width="3" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <polygon points="6,4 16,10 6,16" />
                    </svg>
                  )}
                </div>
              </div>
              
              {/* Track Info */}
              <div
                className="flex-1 space-y-2 min-w-0"
                onClick={() => handleTrackClick(track.id)}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <h4 className="font-medium text-white text-md truncate">{track.title}</h4>
                  <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                </div>
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

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Coins className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalCoins}</div>
            <div className="text-xs text-gray-400">Total Coins</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Music className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{coinsWithAudio}</div>
            <div className="text-xs text-gray-400">With Audio</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{uniqueArtists}</div>
            <div className="text-xs text-gray-400">Artists</div>
          </div>
        </div>

        {/* Featured Songs Section */}
        <FeaturedSongs />

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Genre Filter */}
          <div>
            <div className="text-sm text-gray-400 mb-2">Filter by Genre:</div>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedGenre === genre
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="audioFilter"
              checked={showOnlyWithAudio}
              onChange={(e) => setShowOnlyWithAudio(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="audioFilter" className="text-sm text-gray-400">
              Show only coins with audio
            </label>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-24">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
            <p className="text-white text-lg mb-2">Loading Music Coins...</p>
            {progressMessage && (
              <p className="text-gray-400 text-sm text-center max-w-md">
                {progressMessage}
              </p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-red-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Error Loading Coins</h3>
            </div>
            <p className="text-red-200 mb-4">{error.message}</p>
            <button
              onClick={refreshCoins}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Coins Grid */}
        {!loading && !error && (
          <>
            {filteredCoins.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Music Coins ({filteredCoins.length})
                  </h2>
                  <button
                    onClick={refreshCoins}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    Refresh
                  </button>
                </div>

                {filteredCoins.map((coin) => (
                  <MusicCoinCard
                    key={coin.coinAddress}
                    coinAddress={coin.coinAddress}
                    name={coin.name}
                    symbol={coin.symbol}
                    description={coin.description}
                    artistName={coin.artistName}
                    artistAddress={coin.artistAddress}
                    coverArt={coin.coverArt}
                    audioUrl={coin.audioUrl}
                    price="$0.00" // TODO: Add price fetching
                    change24h="+0.0%" // TODO: Add price change fetching
                    volume24h="$0" // TODO: Add volume fetching
                    marketCap="$0" // TODO: Add market cap fetching
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Music Coins Found</h3>
                <p className="text-gray-400 mb-6">
                  {selectedGenre !== "All" || showOnlyWithAudio
                    ? "Try adjusting your filters or check back later."
                    : "No music coins have been created yet. Be the first to create one!"}
                </p>
                <Link
                  href="/create"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-block"
                >
                  Create Your First Coin
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
