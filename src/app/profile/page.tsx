"use client";

import { useMiniApp } from "@neynar/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  follower_count: number;
  following_count: number;
  profile?: {
    bio?: {
      text: string;
    };
  };
  verified_addresses?: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  score?: number;
}

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: string;
  change24h: string;
  volume24h: string;
  marketCap: string;
  holdings?: string;
}

// Mock data for coins
const mockCreatedCoins: Coin[] = [
  {
    id: "1",
    name: "Sunset Vibes",
    symbol: "SUNSET",
    image: "/api/placeholder/48/48",
    price: "$0.42",
    change24h: "+12.5%",
    volume24h: "$45K",
    marketCap: "$420K",
  },
  {
    id: "2", 
    name: "Ocean Dreams",
    symbol: "OCEAN",
    image: "/api/placeholder/48/48",
    price: "$0.18",
    change24h: "-3.2%",
    volume24h: "$23K",
    marketCap: "$180K",
  },
];

const mockHoldingCoins: Coin[] = [
  {
    id: "3",
    name: "Moonlight Sonata",
    symbol: "MOON",
    image: "/api/placeholder/48/48",
    price: "$1.25",
    change24h: "+8.7%",
    volume24h: "$125K",
    marketCap: "$1.2M",
    holdings: "2,500 MOON",
  },
  {
    id: "4",
    name: "Thunder Bass",
    symbol: "BASS",
    image: "/api/placeholder/48/48", 
    price: "$0.75",
    change24h: "+15.3%",
    volume24h: "$89K",
    marketCap: "$750K",
    holdings: "1,200 BASS",
  },
  {
    id: "5",
    name: "Chill Waves",
    symbol: "CHILL",
    image: "/api/placeholder/48/48",
    price: "$0.33",
    change24h: "-5.1%",
    volume24h: "$67K",
    marketCap: "$330K",
    holdings: "5,000 CHILL",
  },
];

type TabType = 'created' | 'holdings';

export default function ProfilePage() {
  const { context } = useMiniApp();
  const [neynarUser, setNeynarUser] = useState<NeynarUser | null>(null);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('created');
  const [isLoading, setIsLoading] = useState(true);

  // Development mode: use a test FID when not in Farcaster context
  const isDev = process.env.NODE_ENV === 'development';
  const testFid = 3; // Dan Romero's FID for testing
  const effectiveFid = context?.user?.fid || (isDev ? testFid : null);
  const effectiveUser = context?.user || (isDev ? { 
    fid: testFid, 
    username: 'test-user', 
    displayName: 'Test User',
    pfpUrl: null 
  } : null);

  // Fetch Neynar user data and leaderboard rank
  useEffect(() => {
    const fetchUserData = async () => {
      if (effectiveFid) {
        try {
          setIsLoading(true);
          
          // Fetch Neynar user data
          const userResponse = await fetch(`/api/users?fids=${effectiveFid}`);
          const userData = await userResponse.json();
          if (userData.users?.[0]) {
            setNeynarUser(userData.users[0]);
          }

          // Mock leaderboard rank (in production, fetch from actual leaderboard API)
          setLeaderboardRank(Math.floor(Math.random() * 1000) + 1);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [effectiveFid]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderCoinCard = (coin: Coin, showHoldings = false) => (
    <div key={coin.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center space-x-3 mb-3">
        <Image
          src={coin.image}
          alt={coin.name}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-white">{coin.name}</h3>
          <p className="text-sm text-gray-400">{coin.symbol}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">{coin.price}</p>
          <p className={`text-sm ${coin.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {coin.change24h}
          </p>
        </div>
      </div>
      
      {showHoldings && coin.holdings && (
        <div className="mb-3 p-2 bg-purple-600/20 rounded-md">
          <p className="text-sm text-purple-300">Holdings: {coin.holdings}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400">24h Volume</p>
          <p className="text-white font-medium">{coin.volume24h}</p>
        </div>
        <div>
          <p className="text-gray-400">Market Cap</p>
          <p className="text-white font-medium">{coin.marketCap}</p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <main className="max-w-md mx-auto w-full px-4 py-6 pb-24 bg-black min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </main>
    );
  }

  if (!effectiveUser) {
    return (
      <main className="max-w-md mx-auto w-full px-4 py-6 pb-24 bg-black min-h-screen">
        <div className="flex items-center mb-6">
          <Link
            href="/"
            className="mr-3 p-2 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Connect Your Account</h2>
          <p className="text-gray-400 text-center">
            Connect your Farcaster account to view your profile and start creating music coins.
          </p>
        </div>
      </main>
    );
  }

  const profilePicture = neynarUser?.pfp_url || effectiveUser?.pfpUrl;
  const displayName = neynarUser?.display_name || effectiveUser?.displayName || effectiveUser?.username;
  const username = neynarUser?.username || effectiveUser?.username;
  const followerCount = neynarUser?.follower_count || 0;
  const followingCount = neynarUser?.following_count || 0;
  const bio = neynarUser?.profile?.bio?.text;

  return (
    <main className="max-w-md mx-auto w-full px-4 py-6 pb-24 bg-black min-h-screen">
      <div className="flex items-center mb-6">
        <Link
          href="/"
          className="mr-3 p-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Go back"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </div>

      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
          <div className="flex items-start space-x-4 mb-4">
            {profilePicture ? (
              <Image
                src={profilePicture}
                alt="Profile"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full border-2 border-purple-500 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-purple-500">
                <span className="text-white text-2xl">👤</span>
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">{displayName}</h2>
              <p className="text-gray-400 mb-2">@{username}</p>
              {leaderboardRank && (
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">🏆</span>
                  <span className="text-purple-400 font-semibold">#{leaderboardRank}</span>
                  <span className="text-gray-500 text-sm">on leaderboard</span>
                </div>
              )}
              <p className="text-sm text-gray-500">FID: {effectiveUser.fid}</p>
            </div>
          </div>

          {bio && (
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">{bio}</p>
          )}

          {/* Followers/Following */}
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{formatNumber(followerCount)}</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{formatNumber(followingCount)}</div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-white">{mockCreatedCoins.length}</div>
            <div className="text-xs text-gray-400">Coins Created</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-white">{mockHoldingCoins.length}</div>
            <div className="text-xs text-gray-400">Holdings</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-white">$1.2M</div>
            <div className="text-xs text-gray-400">Total Value</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-900/50 rounded-lg p-1 border border-gray-800">
          <button
            onClick={() => setActiveTab('created')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'created'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Created Coins ({mockCreatedCoins.length})
          </button>
          <button
            onClick={() => setActiveTab('holdings')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'holdings'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Holdings ({mockHoldingCoins.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'created' ? (
            <>
              {mockCreatedCoins.length > 0 ? (
                mockCreatedCoins.map(coin => renderCoinCard(coin))
              ) : (
                <div className="bg-gray-900/50 rounded-lg p-8 text-center border border-gray-800">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
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
              {mockHoldingCoins.length > 0 ? (
                mockHoldingCoins.map(coin => renderCoinCard(coin, true))
              ) : (
                <div className="bg-gray-900/50 rounded-lg p-8 text-center border border-gray-800">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
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
      </div>
    </main>
  );
} 