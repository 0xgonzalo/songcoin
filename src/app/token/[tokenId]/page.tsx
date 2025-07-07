"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useZoraEvents } from '~/hooks/useZoraEvents';
import { useAudioPlayer } from '~/components/providers/AudioPlayerProvider';
import { type Track } from '~/lib/tracks';
import { 
  Play, 
  Pause, 
  ExternalLink, 
  User, 
  Music, 
  TrendingUp, 
  Volume2, 
  Loader2,
  ArrowLeft,
  Share2
} from 'lucide-react';

export default function TokenPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;
  const { coins, loading, error } = useZoraEvents();
  const { currentTrack, isPlaying, toggle } = useAudioPlayer();
  const [imageError, setImageError] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);

  // Find the coin by tokenId (coin address)
  const coin = coins.find(c => c.coinAddress.toLowerCase() === tokenId.toLowerCase());

  useEffect(() => {
    // Check if Web Share API is supported
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setShareSupported(true);
    }
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleShare = async () => {
    if (shareSupported && coin) {
      try {
        await navigator.share({
          title: `${coin.name} (${coin.symbol})`,
          text: `Check out this music coin by ${coin.artistName}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    }
  };

  // Create a track object for the audio player
  const track: Track | null = coin ? {
    id: coin.coinAddress,
    title: coin.name,
    artist: coin.artistName,
    album: '',
    genre: 'Music', // Simplified for now
    cover: imageError ? '/api/placeholder/120/120' : coin.coverArt,
    isPlaying: currentTrack?.id === coin.coinAddress && isPlaying,
    mcap: "$0", // TODO: Add market cap fetching
    vol24h: "$0", // TODO: Add volume fetching
    audio: coin.audioUrl
  } : null;

  const handlePlayToggle = () => {
    if (track && coin?.audioUrl) {
      toggle(track);
    }
  };

  const isCurrentlyPlaying = currentTrack?.id === coin?.coinAddress && isPlaying;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mr-3" />
            <span className="text-white">Loading coin details...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-white mb-4">Error Loading Coin</h1>
            <p className="text-gray-400 mb-6">{error.message}</p>
            <Link
              href="/"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Coin not found
  if (!coin) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Coin Not Found</h1>
            <p className="text-gray-400 mb-6">
              The coin you&apos;re looking for doesn&apos;t exist or hasn&apos;t been created yet.
            </p>
            <Link
              href="/"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Explore Coins
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Coins
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Coin Header */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-6">
                {/* Cover Art */}
                <div className="relative w-32 h-32 flex-shrink-0 group">
                  <Image
                    src={imageError ? '/api/placeholder/128/128' : coin.coverArt}
                    alt={coin.name}
                    width={128}
                    height={128}
                    className="w-full h-full rounded-lg object-cover"
                    onError={handleImageError}
                  />
                  {coin.audioUrl && (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
                      onClick={handlePlayToggle}
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white" />
                      )}
                    </div>
                  )}
                  {!coin.audioUrl && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <Volume2 className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Coin Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{coin.name}</h1>
                  <p className="text-xl text-gray-400 mb-4">{coin.symbol}</p>
                  
                  {/* Artist Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-white">{coin.artistName}</span>
                  </div>

                  {/* Description */}
                  {coin.description && (
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {coin.description}
                    </p>
                  )}

                  {/* Genre - simplified for now */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Music className="w-4 h-4 text-purple-400" />
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                      Music
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            {coin.metadata && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {'attributes' in coin.metadata && Array.isArray(coin.metadata.attributes) && 
                   coin.metadata.attributes.map((attr: unknown, index: number) => {
                     if (!attr || typeof attr !== 'object' || attr === null || 
                         !('trait_type' in attr) || !('value' in attr)) {
                       return null;
                     }
                     const typedAttr = attr as { trait_type: string; value: string };
                     return (
                       <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                         <p className="text-sm text-gray-400">{typedAttr.trait_type}</p>
                         <p className="text-white font-medium">{typedAttr.value}</p>
                       </div>
                     );
                   })}
                </div>
              </div>
            )}

            {/* Contract Info */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Contract Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Contract Address:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono text-sm">
                      {coin.coinAddress.slice(0, 6)}...{coin.coinAddress.slice(-4)}
                    </span>
                    <Link
                      href={`https://basescan.org/address/${coin.coinAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Artist Address:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono text-sm">
                      {coin.artistAddress.slice(0, 6)}...{coin.artistAddress.slice(-4)}
                    </span>
                    <Link
                      href={`https://basescan.org/address/${coin.artistAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Blockchain:</span>
                  <span className="text-white">Base</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Trading Section */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Trading</h3>
              
              {/* Price Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Price:</span>
                  <span className="text-white font-bold text-lg">$0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">24h Change:</span>
                  <span className="text-green-400 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +0.0%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Market Cap:</span>
                  <span className="text-white">$0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">24h Volume:</span>
                  <span className="text-white">$0</span>
                </div>
              </div>

              {/* Trading Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  Buy Coin
                </button>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  Sell Coin
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {coin.audioUrl && (
                  <button
                    onClick={handlePlayToggle}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {isCurrentlyPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Play
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </button>
                <Link
                  href={`/profile?address=${coin.artistAddress}`}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <User className="w-5 h-5 mr-2" />
                  View Artist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 