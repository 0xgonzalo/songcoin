"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import Image from "next/image";
import Link from "next/link";
import sdk from "@farcaster/frame-sdk";

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  follower_count: number;
  following_count: number;
  score?: number;
}

export function AppHeader() {
  const { context } = useMiniApp();
  const { address, isConnected } = useAccount();
  const [neynarUser, setNeynarUser] = useState<NeynarUser | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

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
  // Note: context uses 'pfpUrl' (camelCase), Neynar API returns 'pfp_url' (snake_case)
  const profilePicture = neynarUser?.pfp_url || context?.user?.pfpUrl;
  const displayName = neynarUser?.display_name || context?.user?.displayName || context?.user?.username;
  const username = neynarUser?.username || context?.user?.username;
  const fid = neynarUser?.fid || context?.user?.fid;
  const score = neynarUser?.score;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-900/90 backdrop-blur-sm relative">
      {/* Left: Leaderboard button */}
      <div className="flex items-center space-x-2 bg-gray-800/80 rounded-full px-3 py-2">
        <Link
          href="/leaderboard"
          className="flex items-center text-white font-medium hover:text-purple-400 transition-colors"
          aria-label="Leaderboard"
        >
          <span className="text-lg mr-1">🏆</span>
          <span>#777</span>
        </Link>
      </div>

      {/* Middle: Farcaster Avatar (clickable) */}
      <div className="flex-shrink-0 relative">
        {profilePicture ? (
          <div
            className="relative cursor-pointer"
            onClick={() => {
              setIsUserDropdownOpen(!isUserDropdownOpen);
            }}
          >
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
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/20 cursor-pointer"
            onClick={() => {
              setIsUserDropdownOpen(!isUserDropdownOpen);
            }}
          >
            <span className="text-white text-lg">👤</span>
          </div>
        )}
        {/* Dropdown */}
        {isUserDropdownOpen && (
          <div className="absolute top-full right-0 z-50 w-fit mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-3 space-y-2 text-right">
              <h3
                className="font-bold text-sm hover:underline cursor-pointer inline-block"
                onClick={() => fid && sdk.actions.viewProfile({ fid })}
              >
                {displayName}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                @{username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                FID: {fid}
              </p>
              {score !== undefined && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Neynar Score: {score}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Wallet balance */}
      <div className="flex items-center space-x-2 bg-gray-800/80 rounded-full px-3 py-2">
        <span className="text-lg">👛</span>
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