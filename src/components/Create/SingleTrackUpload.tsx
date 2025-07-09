import React, { useRef } from 'react';
import { Music } from 'lucide-react';
import { UploadProgress } from './types';

interface SingleTrackUploadProps {
  audioFile: File | null;
  handleAudioFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  uploadProgress: UploadProgress;
}

export default function SingleTrackUpload({
  audioFile,
  handleAudioFileChange,
  isUploading,
  uploadProgress
}: SingleTrackUploadProps) {
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-white font-semibold mb-2">
        Audio File * (Max 50MB)
        <span className="block text-sm text-gray-400 font-normal">
          Supported: MP3, WAV, OGG, AAC, M4A, FLAC
        </span>
      </label>
      <div
        onClick={() => audioFileInputRef.current?.click()}
        className="w-full h-48 bg-white/10 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-all"
      >
        {audioFile ? (
          <div className="text-center">
            <Music className="w-12 h-12 text-green-400 mb-2 mx-auto" />
            <p className="text-white font-semibold">{audioFile.name}</p>
            <p className="text-gray-400 text-sm">
              {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            {isUploading && uploadProgress.audioFile > 0 && (
              <div className="mt-2">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.audioFile}%` }}
                  />
                </div>
                <p className="text-sm text-green-400 mt-1">
                  {uploadProgress.audioFile.toFixed(0)}%
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <Music className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-400 text-center">
              Click to upload audio file
            </p>
          </>
        )}
      </div>
      <input
        ref={audioFileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.aac,.m4a,.flac,.wma"
        onChange={handleAudioFileChange}
        className="hidden"
      />
    </div>
  );
} 