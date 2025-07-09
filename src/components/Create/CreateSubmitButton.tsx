import React from 'react';
import { CreateMode, Track } from './types';

interface CreateSubmitButtonProps {
  isUploading: boolean;
  isCreatingCoin: boolean;
  coverImage: File | null;
  audioFile: File | null;
  tracks: Track[];
  createMode: CreateMode;
}

export default function CreateSubmitButton({
  isUploading,
  isCreatingCoin,
  coverImage,
  audioFile,
  tracks,
  createMode
}: CreateSubmitButtonProps) {
  const isDisabled = isUploading || isCreatingCoin || !coverImage || 
    (createMode === 'single' ? !audioFile : tracks.some(t => !t.file || !t.name.trim()));

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {isUploading || isCreatingCoin 
        ? `Creating ${createMode === 'single' ? 'Music' : 'Album'} Coin...` 
        : `Create ${createMode === 'single' ? 'Music' : 'Album'} Coin`}
    </button>
  );
} 