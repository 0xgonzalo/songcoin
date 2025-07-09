import React from 'react';
import { CheckCircle } from 'lucide-react';
import { CreateMode } from './types';

interface SuccessScreenProps {
  createMode: CreateMode;
  createdCoinAddress: string;
  onCreateAnother: () => void;
}

export default function SuccessScreen({
  createMode,
  createdCoinAddress,
  onCreateAnother
}: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Coin Created Successfully!</h2>
        <p className="text-gray-300 mb-6">
          Your {createMode === 'single' ? 'music' : 'album'} coin has been created and is now live on the blockchain.
        </p>
        <div className="bg-black/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-400 mb-2">Coin Address:</p>
          <p className="text-white font-mono text-sm break-all">{createdCoinAddress}</p>
        </div>
        <button
          onClick={onCreateAnother}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
        >
          Create Another Coin
        </button>
      </div>
    </div>
  );
} 