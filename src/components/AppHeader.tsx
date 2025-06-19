"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import Image from "next/image";

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  follower_count: number;
  following_count: number;
}

export function AppHeader() {
  const { context } = useMiniApp();
  const { address, isConnected } = useAccount();
  const [neynarUser, setNeynarUser] = useState<NeynarUser | null>(null);
  const [leaderboardCount] = useState("#777");

  // Get wallet balance
  const { data: balance } = useBalance({
    address: address,
  });

  // Fetch Neynar user data when context is available
  useEffect(() => {
    const fetchNeynarUserData = async () => {
      if (context?.user?.fid) {
        try {
          const response = await fetch(`/api/users?fids=${context.user.fid}`);
          const data = await response.json();
          if (data.users?.[0]) {
            setNeynarUser(data.users[0]);
          }
        } catch (error) {
          console.error('Failed to fetch Neynar user data:', error);
        }
      }
    };

    fetchNeynarUserData();
  }, [context?.user?.fid]);

  // Format wallet balance - convert ETH to USD (mock rate)
  const formatBalance = (balance: bigint | undefined, decimals: number = 18) => {
    if (!balance) return "0.00";
    const formatted = formatUnits(balance, decimals);
    const ethAmount = parseFloat(formatted);
    // Mock ETH to USD conversion rate (in production, use real price API)
    const ethToUsd = 3000; // $3000 per ETH
    const usdValue = ethAmount * ethToUsd;
    if (usdValue < 0.01) return "< 0.01";
    return usdValue.toFixed(2);
  };

  // Get profile picture URL - prefer Neynar data, fallback to context
  const profilePicture = neynarUser?.pfp_url || context?.user?.pfpUrl;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-900/90 backdrop-blur-sm">
      {/* Left: Leaderboard count */}
      <div className="flex items-center space-x-2 bg-gray-800/80 rounded-full px-3 py-2">
        <span className="text-lg">🏆</span>
        <span className="text-white font-medium">{leaderboardCount}</span>
      </div>

      {/* Middle: Farcaster Avatar */}
      <div className="flex-shrink-0">
        {profilePicture ? (
          <div className="relative">
            <Image
              src={profilePicture}
              alt="Profile"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full border-2 border-white/20 object-cover"
            />
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/20">
            <span className="text-white text-lg">👤</span>
          </div>
        )}
      </div>

      {/* Right: Wallet balance */}
      <div className="flex items-center space-x-2 bg-gray-800/80 rounded-full px-3 py-2">
        <span className="text-lg">👤</span>
        <span className="text-white font-medium">
          {isConnected && balance 
            ? `$${formatBalance(balance.value, balance.decimals)}`
            : '$0.00'
          }
        </span>
      </div>
    </div>
  );
} 