import React, { useRef } from 'react';
import { Music, Upload } from 'lucide-react';
import Image from 'next/image';
import { UploadProgress } from './types';

interface CoverImageUploadProps {
  coverImagePreview: string | null;
  handleCoverImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  uploadProgress: UploadProgress;
}

export default function CoverImageUpload({
  coverImagePreview,
  handleCoverImageChange,
  isUploading,
  uploadProgress
}: CoverImageUploadProps) {
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-white font-semibold mb-2">
        Cover Image * (Max 5MB)
      </label>
      <div
        onClick={() => coverImageInputRef.current?.click()}
        className="w-full h-48 bg-white/10 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-all"
      >
        {coverImagePreview ? (
          <div className="relative w-full h-full">
            <Image
              src={coverImagePreview}
              alt="Cover preview"
              fill
              className="object-cover rounded-xl"
            />
            {isUploading && uploadProgress.coverImage > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                <div className="text-white text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p>{uploadProgress.coverImage.toFixed(0)}%</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Music className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-400 text-center">
              Click to upload cover image
            </p>
          </>
        )}
      </div>
      <input
        ref={coverImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverImageChange}
        className="hidden"
      />
    </div>
  );
} 