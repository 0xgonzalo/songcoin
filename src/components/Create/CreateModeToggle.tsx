import React from 'react';
import { CreateMode } from './types';

interface CreateModeToggleProps {
  createMode: CreateMode;
  setCreateMode: (mode: CreateMode) => void;
}

export default function CreateModeToggle({ createMode, setCreateMode }: CreateModeToggleProps) {
  return (
    <div className="flex mb-8 bg-white/10 rounded-xl p-1">
      <button
        onClick={() => setCreateMode('single')}
        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
          createMode === 'single' 
            ? 'bg-purple-500 text-white' 
            : 'text-gray-300 hover:text-white'
        }`}
      >
        Single Track
      </button>
      <button
        onClick={() => setCreateMode('album')}
        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
          createMode === 'album' 
            ? 'bg-purple-500 text-white' 
            : 'text-gray-300 hover:text-white'
        }`}
      >
        Album
      </button>
    </div>
  );
} 