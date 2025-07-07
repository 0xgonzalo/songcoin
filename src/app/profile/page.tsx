"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useZoraEvents } from '~/hooks/useZoraEvents';
import MusicCoinCard from '~/components/MusicCoinCard';
import { Loader2, Music, User, Wallet, ExternalLink } from 'lucide-react';

type TabType = 'created' | 'holdings';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { coins, loading, error, refreshCoins } = useZoraEvents();
  const [activeTab, setActiveTab] = useState<TabType>('created');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter coins created by the current user
  const createdCoins = coins.filter(coin => 
    address && coin.artistAddress.toLowerCase() === address.toLowerCase()
  );

  // TODO: Add holdings data when we have trading functionality
  const holdingCoins: unknown[] = [];

  // Calculate stats
  const totalCreated = createdCoins.length;
  const totalHoldings = holdingCoins.length;
  const totalValue = "$0"; // TODO: Calculate actual value

  const renderCoinCard = (coin: unknown, showHoldings = false) => {
    // Type guard for coin object
    if (!coin || typeof coin !== 'object' || coin === null) {
      return null;
    }
    
    const typedCoin = coin as {
      coinAddress: string;
      name: string;
      symbol: string;
      description: string;
      artistName: string;
      artistAddress: string;
      coverArt: string;
      audioUrl?: string;
      holdings?: string;
    };
    
    return (
      <MusicCoinCard
        key={typedCoin.coinAddress}
        coinAddress={typedCoin.coinAddress}
        name={typedCoin.name}
        symbol={typedCoin.symbol}
        description={typedCoin.description}
        artistName={typedCoin.artistName}
        artistAddress={typedCoin.artistAddress}
        coverArt={typedCoin.coverArt}
        audioUrl={typedCoin.audioUrl}
        price="$0.00" // TODO: Add price fetching
        change24h="+0.0%" // TODO: Add price change fetching
        volume24h="$0" // TODO: Add volume fetching
        marketCap="$0" // TODO: Add market cap fetching
        holdings={showHoldings ? typedCoin.holdings : undefined}
        showHoldings={showHoldings}
      />
    );
  };

  if (isLoading) {
    return (
      <main className="max-w-md mx-auto w-full px-4 py-6 pb-24 bg-black min-h-screen">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="max-w-md mx-auto w-full px-4 py-6 pb-24 bg-black min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Please connect your wallet to view your profile and manage your music coins.
            </p>
            <Link
              href="/"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-block"
            >
              Go Back
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto w-full px-4 py-6 pb-24 bg-black min-h-screen">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">My Profile</h1>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Wallet Address:</p>
              <Link
                href={`https://basescan.org/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-white font-mono text-sm break-all mt-1">
              {address}
            </p>
          </div>
        </div>

        {/* Loading State for Coins */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-purple-500 animate-spin mr-2" />
            <span className="text-gray-400">Loading your coins...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
            <p className="text-red-200 text-sm mb-2">Error loading coins: {error.message}</p>
            <button
              onClick={refreshCoins}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
              <div className="text-2xl font-bold text-white">{totalCreated}</div>
              <div className="text-xs text-gray-400">Coins Created</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
              <div className="text-2xl font-bold text-white">{totalHoldings}</div>
              <div className="text-xs text-gray-400">Holdings</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
              <div className="text-2xl font-bold text-white">{totalValue}</div>
              <div className="text-xs text-gray-400">Total Value</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        {!loading && !error && (
          <div className="flex bg-gray-900/50 rounded-lg p-1 border border-gray-800">
            <button
              onClick={() => setActiveTab('created')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'created'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Created Coins ({totalCreated})
            </button>
            <button
              onClick={() => setActiveTab('holdings')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'holdings'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Holdings ({totalHoldings})
            </button>
          </div>
        )}

        {/* Tab Content */}
        {!loading && !error && (
          <div className="space-y-4">
            {activeTab === 'created' ? (
              <>
                {createdCoins.length > 0 ? (
                  createdCoins.map(coin => renderCoinCard(coin))
                ) : (
                  <div className="bg-gray-900/50 rounded-lg p-8 text-center border border-gray-800">
                    <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">No Coins Created Yet</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Start creating your first music coin and build your portfolio.
                    </p>
                    <Link
                      href="/create"
                      className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Create Your First Coin
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <>
                {holdingCoins.length > 0 ? (
                  holdingCoins.map(coin => renderCoinCard(coin, true))
                ) : (
                  <div className="bg-gray-900/50 rounded-lg p-8 text-center border border-gray-800">
                    <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">No Holdings Yet</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Start trading music coins to build your portfolio.
                    </p>
                    <Link
                      href="/"
                      className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Explore Coins
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 