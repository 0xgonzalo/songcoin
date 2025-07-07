"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, TrendingUp, ExternalLink, Volume2 } from 'lucide-react';
import { useAudioPlayer } from './providers/AudioPlayerProvider';
import { type Track } from '~/lib/tracks';

export interface MusicCoinCardProps {
  coinAddress: string;
  name: string;
  symbol: string;
  description?: string;
  artistName: string;
  artistAddress: string;
  coverArt: string;
  audioUrl?: string;
  price?: string;
  change24h?: string;
  volume24h?: string;
  marketCap?: string;
  holdings?: string;
  showHoldings?: boolean;
  className?: string;
  onTradeClick?: () => void;
}

export default function MusicCoinCard({
  coinAddress,
  name,
  symbol,
  description,
  artistName,
  coverArt,
  audioUrl,
  price = "$0.00",
  change24h = "+0.0%",
  volume24h = "$0",
  marketCap = "$0",
  holdings,
  showHoldings = false,
  className = "",
  onTradeClick
}: MusicCoinCardProps) {
  const { currentTrack, isPlaying, toggle } = useAudioPlayer();
  const [imageError, setImageError] = useState(false);

  // Create a track object for the audio player
  const track: Track = {
    id: coinAddress,
    title: name,
    artist: artistName,
    album: '',
    genre: 'Music',
    cover: imageError ? '/api/placeholder/120/120' : coverArt,
    isPlaying: currentTrack?.id === coinAddress && isPlaying,
    mcap: marketCap,
    vol24h: volume24h,
    audio: audioUrl
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (audioUrl) {
      toggle(track);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const isCurrentlyPlaying = currentTrack?.id === coinAddress && isPlaying;
  const isPositiveChange = change24h.startsWith('+');

  return (
    <div className={`bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        {/* Cover Art with Play Button */}
        <div className="relative w-16 h-16 flex-shrink-0 group">
          <Image
            src={imageError ? '/api/placeholder/64/64' : coverArt}
            alt={name}
            width={64}
            height={64}
            className="w-full h-full rounded-lg object-cover"
            onError={handleImageError}
          />
          {audioUrl && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
              onClick={handlePlayToggle}
            >
              {isCurrentlyPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </div>
          )}
          {!audioUrl && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
              <Volume2 className="w-2 h-2 text-gray-400" />
            </div>
          )}
        </div>

        {/* Coin Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-white truncate">{name}</h3>
            <span className="text-sm text-gray-400">({symbol})</span>
          </div>
          <p className="text-sm text-gray-400 truncate">by {artistName}</p>
          {description && (
            <p className="text-xs text-gray-500 truncate mt-1">{description}</p>
          )}
        </div>

        {/* Price Info */}
        <div className="text-right">
          <p className="font-semibold text-white">{price}</p>
          <p className={`text-sm flex items-center ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${isPositiveChange ? '' : 'rotate-180'}`} />
            {change24h}
          </p>
        </div>
      </div>

      {/* Holdings Display */}
      {showHoldings && holdings && (
        <div className="mb-4 p-3 bg-purple-600/20 rounded-lg">
          <p className="text-sm text-purple-300">Holdings: {holdings}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-400">24h Volume</p>
          <p className="text-white font-medium">{volume24h}</p>
        </div>
        <div>
          <p className="text-gray-400">Market Cap</p>
          <p className="text-white font-medium">{marketCap}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Link 
          href={`/token/${coinAddress}`}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center"
        >
          View Details
        </Link>
        {onTradeClick && (
          <button
            onClick={onTradeClick}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Trade
          </button>
        )}
        <Link
          href={`https://basescan.org/address/${coinAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
} 