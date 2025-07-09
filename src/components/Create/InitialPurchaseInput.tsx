import React from 'react';

interface InitialPurchaseInputProps {
  initialPurchase: string;
  setInitialPurchase: (value: string) => void;
}

export default function InitialPurchaseInput({
  initialPurchase,
  setInitialPurchase
}: InitialPurchaseInputProps) {
  return (
    <div>
      <label className="block text-white font-semibold mb-2">
        Initial Purchase (ETH)
      </label>
      <input
        type="number"
        step="0.0001"
        min="0"
        value={initialPurchase}
        onChange={(e) => setInitialPurchase(e.target.value)}
        placeholder="0.0001"
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <p className="text-sm text-gray-400 mt-1">
        Amount of ETH to initially purchase when creating the coin
      </p>
    </div>
  );
} 