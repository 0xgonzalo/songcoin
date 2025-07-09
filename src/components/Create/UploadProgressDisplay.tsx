import React from 'react';
import { CreateMode, UploadProgress } from './types';

interface UploadProgressDisplayProps {
  isUploading: boolean;
  currentStep: string;
  uploadProgress: UploadProgress;
  createMode: CreateMode;
}

export default function UploadProgressDisplay({
  isUploading,
  currentStep,
  uploadProgress,
  createMode
}: UploadProgressDisplayProps) {
  if (!isUploading) return null;

  const overallProgress = (uploadProgress.coverImage + uploadProgress.audioFile + uploadProgress.metadata + uploadProgress.validation) / 4;

  return (
    <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
      <p className="text-blue-200 mb-2">{currentStep}</p>
      <div className="w-full bg-blue-900/50 rounded-full h-2 mb-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs text-blue-300">
        <div>Cover: {uploadProgress.coverImage.toFixed(0)}%</div>
        <div>{createMode === 'single' ? 'Audio' : 'Tracks'}: {uploadProgress.audioFile.toFixed(0)}%</div>
        <div>Metadata: {uploadProgress.metadata.toFixed(0)}%</div>
        <div>Validation: {uploadProgress.validation.toFixed(0)}%</div>
      </div>
    </div>
  );
} 