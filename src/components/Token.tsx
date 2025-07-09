"use client";

import { useState } from "react";
import Image from "next/image";
import { getTokenById } from "~/lib/tracks";

export default function Token({ tokenId = "dominga" }: { tokenId?: string }) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('0,000111');
  const [ethBalance] = useState('0');
  const [selectedTab, setSelectedTab] = useState<'holders' | 'activity' | 'details'>('holders');

  const token = getTokenById(tokenId);
  
  if (!token) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Token Not Found</h1>
          <p className="text-gray-400">The token &quot;{tokenId}&quot; does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Image 
            src={token.creator.avatar} 
            alt={token.creator.username}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
          />
          <span className="text-white font-medium">{token.creator.username}</span>
          <span className="text-gray-400 text-sm">4h</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Artwork */}
        <div className="lg:w-1/2 p-6 flex items-center justify-center bg-gray-900/20">
          <div className="max-w-md w-full">
            <Image 
              src={token.cover}
              alt={token.title}
              width={400}
              height={400}
              className="w-full h-auto rounded-xl shadow-2xl"
            />
          </div>
        </div>

        {/* Right Side - Token Info & Trading */}
        <div className="lg:w-1/2 p-6 space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{token.title}</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Market Cap</div>
              <div className="flex items-center justify-center space-x-1">
                <span className={`text-xl font-bold ${token.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.priceChange >= 0 ? '▲' : '▼'}
                </span>
                <span className={`text-xl font-bold ${token.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.mcap}
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Total Volume</div>
              <div className="flex items-center justify-center space-x-1">
                <span className="text-white text-xl font-bold">◐</span>
                <span className="text-white text-xl font-bold">{token.totalVolume}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Creator Earnings</div>
              <div className="flex items-center justify-center space-x-1">
                <span className="text-white text-xl font-bold">💰</span>
                <span className="text-white text-xl font-bold">{token.creatorEarnings}</span>
              </div>
            </div>
          </div>

          {/* Trading Section */}
          <div className="space-y-6">
            {/* Buy/Sell Toggle */}
            <div className="flex items-center space-x-4">
              <button
                className={`px-8 py-3 rounded-xl font-semibold text-lg ${
                  tradeType === 'buy' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setTradeType('buy')}
              >
                Buy
              </button>
              <button
                className={`px-8 py-3 rounded-xl font-semibold text-lg ${
                  tradeType === 'sell' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setTradeType('sell')}
              >
                Sell
              </button>
              <div className="ml-auto text-gray-400">
                Balance <span className="text-white font-bold">{ethBalance} ETH</span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  className="bg-transparent text-3xl font-bold flex-1 outline-none text-white placeholder:text-gray-500"
                  placeholder="0,000111"
                  value={tradeAmount}
                  onChange={e => setTradeAmount(e.target.value)}
                />
                <div className="flex items-center space-x-2 bg-gray-700 rounded-xl px-4 py-2 border border-gray-600">
                  <span className="text-blue-400 text-xl">Ξ</span>
                  <span className="font-semibold text-white">ETH</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            {tradeType === 'buy' ? (
              <div className="grid grid-cols-4 gap-3">
                {['0.001 ETH', '0.01 ETH', '0.1 ETH', 'Max'].map((amount) => (
                  <button
                    key={amount}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 font-semibold text-white transition-colors"
                    onClick={() => setTradeAmount(amount.replace(' ETH', ''))}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {['25%', '50%', '75%', '100%'].map((percent) => (
                  <button
                    key={percent}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 font-semibold text-white transition-colors"
                  >
                    {percent}
                  </button>
                ))}
              </div>
            )}

            {/* Insufficient Balance Warning */}
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <span className="text-gray-400 font-medium">Insufficient balance</span>
            </div>

            {/* Minimum Received */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
              <span className="text-gray-400">Minimum received</span>
              <div className="flex items-center space-x-2">
                <Image 
                  src="/placeholders/1.jpg" 
                  alt="token" 
                  width={24} 
                  height={24} 
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white font-bold">291,626</span>
              </div>
            </div>
          </div>

          {/* Bottom Tabs */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex space-x-8">
              <button
                className={`pb-2 font-medium border-b-2 transition-colors ${
                  selectedTab === 'holders'
                    ? 'text-white border-white'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
                onClick={() => setSelectedTab('holders')}
              >
                Holders <span className="text-gray-500">6</span>
              </button>
              <button
                className={`pb-2 font-medium border-b-2 transition-colors ${
                  selectedTab === 'activity'
                    ? 'text-white border-white'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
                onClick={() => setSelectedTab('activity')}
              >
                Activity
              </button>
              <button
                className={`pb-2 font-medium border-b-2 transition-colors ${
                  selectedTab === 'details'
                    ? 'text-white border-white'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
                onClick={() => setSelectedTab('details')}
              >
                Details
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {selectedTab === 'holders' && (
                <div className="text-gray-400">
                  <p>6 holders for this token</p>
                </div>
              )}
              {selectedTab === 'activity' && (
                <div className="text-gray-400">
                  <p>Recent trading activity will appear here</p>
                </div>
              )}
              {selectedTab === 'details' && (
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Genre:</span>
                    <span className="text-white">{token.genre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Creator:</span>
                    <span className="text-white">{token.artist}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token ID:</span>
                    <span className="text-white">{token.id}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 