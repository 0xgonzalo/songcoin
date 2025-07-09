"use client";

import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, ExternalLink, Loader2 } from 'lucide-react';
import { useTradeCoin } from '~/hooks/useTradeCoin';
import { Address } from 'viem';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinAddress: Address;
  coinName: string;
  coinSymbol: string;
  tradeType: 'buy' | 'sell';
}

export function TradeModal({
  isOpen,
  onClose,
  coinAddress,
  coinName,
  coinSymbol,
  tradeType
}: TradeModalProps) {
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('1');
  const [customSlippage, setCustomSlippage] = useState(false);
  
  const { isTrading, tradeError, tradeSuccess, lastTxHash, buyCoins, sellCoins } = useTradeCoin();

  // Add a new state for controlling the share modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Show the success modal when tradeSuccess becomes true
  useEffect(() => {
    if (isOpen && tradeSuccess && lastTxHash) {
      setShowSuccessModal(true);
    }
    // Reset when modal closes
    if (!isOpen) {
      setShowSuccessModal(false);
    }
  }, [isOpen, tradeSuccess, lastTxHash]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    try {
      const slippageValue = parseFloat(slippage) || 1;
      
      if (tradeType === 'buy') {
        await buyCoins(coinAddress, amount, slippageValue);
      } else {
        await sellCoins(coinAddress, amount, slippageValue);
      }
    } catch (error) {
      // Error is already handled by the hook, just log it
      console.error('Trade error:', error);
    }
  };

  const handleClose = () => {
    if (!isTrading) {
      setAmount('');
      setSlippage('1');
      setCustomSlippage(false);
      onClose();
    }
  };

  const isBuy = tradeType === 'buy';

  if (!isOpen) return null;

  // Success Modal UI
  const SuccessModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-2 text-green-600">Success!</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-200">
          You bought <span className="font-semibold">{coinName} ({coinSymbol})</span> successfully!
        </p>
        <a
          href={`https://basescan.org/tx/${lastTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mb-4 text-blue-600 underline text-sm"
        >
          View Transaction on BaseScan
        </a>
        <div className="flex flex-col gap-3">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            onClick={() => {
              // Open Farcaster share frame (replace with your Farcaster share logic)
              window.open(
                `https://warpcast.com/~/compose?text=I just bought ${coinName} (${coinSymbol}) on SongCoin! Check it out: https://songcoin.xyz/token/${coinAddress}`,
                '_blank'
              );
            }}
          >
            Share on Farcaster
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
            onClick={() => {
              setShowSuccessModal(false);
              onClose();
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Existing modal code */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                {isBuy ? (
                  <>
                    <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
                    Buy {coinSymbol}
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-6 h-6 text-red-400 mr-2" />
                    Sell {coinSymbol}
                  </>
                )}
              </h2>
              <button
                onClick={handleClose}
                disabled={isTrading}
                className="text-gray-400 hover:text-white disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Coin Info */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">{coinName}</h3>
                <p className="text-gray-400">{coinSymbol}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {coinAddress.slice(0, 6)}...{coinAddress.slice(-4)}
                </p>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Amount ({isBuy ? 'ETH' : coinSymbol})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                disabled={isTrading}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              />
              <div className="flex space-x-2 mt-2">
                {['0.001', '0.01', '0.1', '1'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    disabled={isTrading}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md transition-colors disabled:opacity-50"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Slippage Settings */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Slippage Tolerance
              </label>
              <div className="flex space-x-2 mb-2">
                {['0.5', '1', '2'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setSlippage(preset);
                      setCustomSlippage(false);
                    }}
                    disabled={isTrading}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                      slippage === preset && !customSlippage
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
                <button
                  onClick={() => setCustomSlippage(true)}
                  disabled={isTrading}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                    customSlippage
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  Custom
                </button>
              </div>
              
              {customSlippage && (
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  placeholder="Enter slippage %"
                  disabled={isTrading}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
              )}
            </div>

            {/* Trade Summary */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">You {isBuy ? 'pay' : 'receive'}:</span>
                  <span className="text-white">{amount || '0'} {isBuy ? 'ETH' : coinSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">You {isBuy ? 'receive' : 'pay'}:</span>
                  <span className="text-white">~{amount || '0'} {isBuy ? coinSymbol : 'ETH'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Slippage:</span>
                  <span className="text-white">{slippage}%</span>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {tradeSuccess && lastTxHash && (
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6">
                <div className="flex items-center text-green-400 mb-2">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Trade Successful!</span>
                </div>
                <div className="flex items-center text-sm text-green-300">
                  <span className="mr-2">Tx: {lastTxHash.slice(0, 10)}...{lastTxHash.slice(-6)}</span>
                  <a
                    href={`https://basescan.org/tx/${lastTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-green-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Error Message */}
            {tradeError && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
                <div className="text-red-400 text-sm">{tradeError.message}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={isTrading}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTrade}
                disabled={isTrading || !amount || parseFloat(amount) <= 0}
                className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center ${
                  isBuy
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isTrading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Trading...
                  </>
                ) : (
                  `${isBuy ? 'Buy' : 'Sell'} ${coinSymbol}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccessModal && <SuccessModal />}
    </>
  );
} 