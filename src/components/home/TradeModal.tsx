"use client";

import Image from "next/image";

interface TradeModalProps {
  open: boolean;
  onClose: () => void;
  tradeType: 'buy' | 'sell';
  setTradeType: (type: 'buy' | 'sell') => void;
  tradeAmount: string;
  setTradeAmount: (amount: string) => void;
  ethBalance: string;
}

export default function TradeModal({
  open,
  onClose,
  tradeType,
  setTradeType,
  tradeAmount,
  setTradeAmount,
  ethBalance
}: TradeModalProps) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-xs md:max-w-md mx-4 md:mx-8 p-6 md:p-10 relative" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl" onClick={onClose}>&times;</button>
        
        {/* Buy/Sell toggle and balance */}
        <div className="flex items-center mb-4">
          <button
            className={`px-5 py-2 rounded-xl font-semibold mr-2 ${tradeType === 'buy' ? 'bg-green-500 text-white' : 'bg-gray-100 text-black'}`}
            onClick={() => setTradeType('buy')}
          >
            Buy
          </button>
          <button
            className={`px-5 py-2 rounded-xl font-semibold ${tradeType === 'sell' ? 'text-white' : 'bg-gray-100 text-black'}`}
            style={tradeType === 'sell' ? { backgroundColor: 'color(display-p3 0.94 0.03 0.93)' } : {}}
            onClick={() => setTradeType('sell')}
          >
            Sell
          </button>
          <span className="ml-auto pl-4 text-gray-400 font-medium">Balance <span className="text-black font-bold">{ethBalance} ETH</span></span>
        </div>
        
        {/* Input */}
        <div className="bg-gray-100 rounded-xl flex items-center px-4 py-6 mb-4">
          <input
            type="text"
            className="bg-transparent text-3xl font-semibold flex-1 outline-none border-none text-black placeholder:text-gray-400"
            placeholder="0,000111"
            value={tradeAmount}
            onChange={e => setTradeAmount(e.target.value)}
          />
          <div className="flex items-center ml-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
            <span className="text-blue-600 text-xl mr-1">⎯</span> <br />
            <span className="font-semibold text-black">ETH</span>
            <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        
        {/* Quick amount buttons or percent options */}
        {tradeType === 'buy' ? (
          <div className="mb-6">
            <select className="w-full bg-white border border-gray-200 rounded-xl py-3 font-semibold text-gray-800">
              <option value="0.001">0.001 ETH</option>
              <option value="0.01">0.01 ETH</option>
              <option value="0.1">0.1 ETH</option>
              <option value="max">Max</option>
            </select>
          </div>
        ) : (
          <div className="flex gap-2 mb-6">
            <button className="flex-1 bg-white border border-gray-200 rounded-xl py-3 font-semibold text-gray-800">25%</button>
            <button className="flex-1 bg-white border border-gray-200 rounded-xl py-3 font-semibold text-gray-800">50%</button>
            <button className="flex-1 bg-white border border-gray-200 rounded-xl py-3 font-semibold text-gray-800">75%</button>
            <button className="flex-1 bg-white border border-gray-200 rounded-xl py-3 font-semibold text-gray-800">100%</button>
          </div>
        )}
        
        {/* Buy/Sell button */}
        <button
          className={`w-full text-white text-xl font-semibold py-4 rounded-xl mb-4 ${tradeType === 'buy' ? 'bg-green-500 hover:bg-green-600' : ''}`}
          style={tradeType === 'sell' ? { backgroundColor: 'color(display-p3 0.94 0.03 0.93)' } : {}}
        >
          {tradeType === 'buy' ? 'Buy' : 'Sell'}
        </button>
        
        {/* Minimum received */}
        <div className="flex items-center text-gray-400 text-lg font-medium">
          <span>Minimum received</span>
          <span className="ml-auto flex items-center gap-2 text-black font-semibold">
            <Image src="https://i.imgur.com/8Km9tLL.png" alt="token" width={24} height={24} className="w-6 h-6 rounded-full" />
            7,482,605
          </span>
        </div>
      </div>
    </div>
  );
} 