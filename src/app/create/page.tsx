"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

// Genre options matching the home page
const genres = ["Ambient", "Lo-fi", "Synthwave", "Chillhop", "Downtempo"];

interface CoinMetadata {
  name: string;
  symbol: string;
  description: string;
  genre: string;
  artistName: string;
  imageFile: File | null;
  audioFile: File | null;
}

export default function CreatePage() {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const [metadata, setMetadata] = useState<CoinMetadata>({
    name: "",
    symbol: "",
    description: "",
    genre: genres[0],
    artistName: "",
    imageFile: null,
    audioFile: null,
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CoinMetadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, imageFile: 'Please select a valid image file' }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, imageFile: 'Image size must be less than 5MB' }));
        return;
      }

      setMetadata(prev => ({ ...prev, imageFile: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.imageFile;
        return newErrors;
      });
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav)$/i)) {
        setErrors(prev => ({ ...prev, audioFile: 'Please select a valid audio file (.mp3 or .wav)' }));
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, audioFile: 'Audio file size must be less than 50MB' }));
        return;
      }

      setMetadata(prev => ({ ...prev, audioFile: file }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.audioFile;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!metadata.name.trim()) newErrors.name = 'Track name is required';
    if (!metadata.symbol.trim()) newErrors.symbol = 'Symbol is required';
    if (!metadata.description.trim()) newErrors.description = 'Description is required';
    if (!metadata.artistName.trim()) newErrors.artistName = 'Artist name is required';
    if (!metadata.imageFile) newErrors.imageFile = 'Cover image is required';
    if (!metadata.audioFile) newErrors.audioFile = 'Audio file is required';

    if (metadata.symbol && !/^[A-Z]{3,6}$/.test(metadata.symbol)) {
      newErrors.symbol = 'Symbol must be 3-6 uppercase letters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCoin = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      // TODO: Implement Zora SDK integration
      // This would include:
      // 1. Upload image and audio to IPFS
      // 2. Create metadata JSON
      // 3. Deploy coin contract using Zora SDK
      // 4. Handle transaction confirmation
      
      console.log('Creating coin with metadata:', metadata);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to success page or home
      router.push('/');
    } catch (error) {
      console.error('Error creating coin:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="max-w-md mx-auto w-full px-4 py-6 pb-24 bg-black min-h-screen">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="mr-3 p-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Go back"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white">Create Music Coin</h1>
      </div>

      <div className="space-y-6">
        {/* Cover Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="image-upload" className="text-white font-medium">
            Cover Image *
          </Label>
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition-colors"
            onClick={() => imageInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Cover preview"
                  width={200}
                  height={200}
                  className="mx-auto rounded-lg object-cover"
                />
                <div className="mt-2 text-sm text-gray-400">
                  Click to change image
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400">Click to upload cover image</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          {errors.imageFile && (
            <p className="text-red-400 text-sm">{errors.imageFile}</p>
          )}
        </div>

        {/* Audio File Upload */}
        <div className="space-y-2">
          <Label htmlFor="audio-upload" className="text-white font-medium">
            Audio File *
          </Label>
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition-colors"
            onClick={() => audioInputRef.current?.click()}
          >
            {metadata.audioFile ? (
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <p className="text-white font-medium">{metadata.audioFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(metadata.audioFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-xs text-gray-500">Click to change file</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <p className="text-gray-400">Click to upload audio file</p>
                <p className="text-xs text-gray-500">MP3, WAV up to 50MB</p>
              </div>
            )}
          </div>
          <input
            ref={audioInputRef}
            type="file"
            accept=".mp3,.wav,audio/*"
            onChange={handleAudioUpload}
            className="hidden"
            id="audio-upload"
          />
          {errors.audioFile && (
            <p className="text-red-400 text-sm">{errors.audioFile}</p>
          )}
        </div>

        {/* Track Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white font-medium">
            Track Name *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter track name"
            value={metadata.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
          />
          {errors.name && (
            <p className="text-red-400 text-sm">{errors.name}</p>
          )}
        </div>

        {/* Symbol */}
        <div className="space-y-2">
          <Label htmlFor="symbol" className="text-white font-medium">
            Symbol *
          </Label>
          <Input
            id="symbol"
            type="text"
            placeholder="e.g., MUSIC"
            value={metadata.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
            maxLength={6}
          />
          <p className="text-xs text-gray-500">3-6 uppercase letters</p>
          {errors.symbol && (
            <p className="text-red-400 text-sm">{errors.symbol}</p>
          )}
        </div>

        {/* Artist Name */}
        <div className="space-y-2">
          <Label htmlFor="artist" className="text-white font-medium">
            Artist Name *
          </Label>
          <Input
            id="artist"
            type="text"
            placeholder="Enter artist name"
            value={metadata.artistName}
            onChange={(e) => handleInputChange('artistName', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
          />
          {errors.artistName && (
            <p className="text-red-400 text-sm">{errors.artistName}</p>
          )}
        </div>

        {/* Genre */}
        <div className="space-y-2">
          <Label htmlFor="genre" className="text-white font-medium">
            Genre *
          </Label>
          <select
            id="genre"
            value={metadata.genre}
            onChange={(e) => handleInputChange('genre', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-purple-500 focus:outline-none"
          >
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-white font-medium">
            Description *
          </Label>
          <textarea
            id="description"
            placeholder="Describe your track and what makes it special..."
            value={metadata.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-purple-500 focus:outline-none placeholder-gray-400 resize-none"
          />
          {errors.description && (
            <p className="text-red-400 text-sm">{errors.description}</p>
          )}
        </div>

        {/* Create Button */}
        <Button
          onClick={handleCreateCoin}
          disabled={isCreating}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Coin...
            </div>
          ) : (
            'Create Music Coin'
          )}
        </Button>

        {/* Info Section */}
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
          <h3 className="text-white font-medium">What happens next?</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Your files will be uploaded to IPFS</li>
            <li>• A smart contract will be deployed for your coin</li>
            <li>• Your music coin will be available for trading</li>
            <li>• You&apos;ll earn from every transaction</li>
          </ul>
        </div>
      </div>
    </main>
  );
} 