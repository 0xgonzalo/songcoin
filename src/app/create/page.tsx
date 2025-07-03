"use client";

import React, { useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { Music, LogIn } from 'lucide-react';
import Image from 'next/image';
import { useZoraCoins, CoinData } from '~/hooks/useZoraCoins';
import { uploadFileToIPFS, uploadJSONToIPFS } from '~/lib/pinataService';

const MUSIC_GENRES = [
  "Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Classical", 
  "R&B", "Country", "Folk", "Metal", "Ambient", "Indie", "Other"
];

export default function CreatePage() {
  const { address, isConnected } = useAccount();
  const { 
    createMusicCoin, 
    isCreatingCoin, 
    createCoinSuccess,
    createdCoinAddress
  } = useZoraCoins();

  // Form state
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [initialPurchase, setInitialPurchase] = useState('0.0001');

  // Upload progress state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [error, setError] = useState('');

  // File input refs
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Cover image must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setCoverImage(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setError('Audio file must be less than 50MB');
        return;
      }
      
      // Get file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      // List of supported audio formats
      const supportedFormats = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma'];
      
      // Validate file type - check both MIME type and file extension
      const isValidMimeType = file.type.startsWith('audio/');
      const isValidExtension = fileExtension && supportedFormats.includes(fileExtension);
      
      if (!isValidMimeType && !isValidExtension) {
        setError(`Please select a valid audio file. Supported formats: ${supportedFormats.join(', ')}`);
        return;
      }
      
      setAudioFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!coverImage || !audioFile) {
      setError('Please select both cover image and audio file');
      return;
    }

    if (!name || !symbol || !description || !artist) {
      setError('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Stage 1: Upload cover image
      setUploadStage('Uploading cover image...');
      const coverImageCid = await uploadFileToIPFS(coverImage, (progress) => {
        setUploadProgress(progress * 0.3); // 30% of total progress
      });

      // Stage 2: Upload audio file
      setUploadStage('Uploading audio file...');
      const audioFileCid = await uploadFileToIPFS(audioFile, (progress) => {
        setUploadProgress(30 + (progress * 0.4)); // 30-70% of total progress
      });

      // Stage 3: Upload metadata
      setUploadStage('Uploading metadata...');
      const metadata = {
        name,
        description,
        image: `ipfs://${coverImageCid}`,
        animation_url: `ipfs://${audioFileCid}`,
        attributes: [
          { trait_type: 'Artist', value: artist },
          { trait_type: 'Genre', value: genre || 'Other' },
          { trait_type: 'Type', value: 'Music' }
        ]
      };

      const metadataCid = await uploadJSONToIPFS(metadata);
      setUploadProgress(80);

      // Stage 4: Create coin
      setUploadStage('Creating coin...');
      const coinData: CoinData = {
        name,
        symbol: symbol.toUpperCase(),
        uri: `ipfs://${metadataCid}`,
        payoutRecipient: address,
        platformReferrer: "0x32C8ACD3118766CBE5c3E45a44BCEDde953EF627",
        initialPurchaseWei: parseEther(initialPurchase)
      };

      await createMusicCoin(coinData);
      setUploadProgress(100);
      setUploadStage('Coin created successfully!');

    } catch (err) {
      console.error('Error creating coin:', err);
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Show success state
  if (createCoinSuccess && createdCoinAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Coin Created Successfully!</h2>
          <p className="text-gray-300 mb-6">Your music coin has been created and is now live on the blockchain.</p>
          <div className="bg-black/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">Coin Address:</p>
            <p className="text-white font-mono text-sm break-all">{createdCoinAddress}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
          >
            Create Another Coin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Create Music Coin</h1>
          <p className="text-gray-300">Upload your music and create a tradeable coin</p>
        </div>

        {!isConnected ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
            <LogIn className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300 mb-6">You need to connect your wallet to create a music coin</p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Coin Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., My Amazing Song"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="e.g., SONG"
                    maxLength={10}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your music..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Artist *
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Artist name"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select genre</option>
                    {MUSIC_GENRES.map((g) => (
                      <option key={g} value={g} className="bg-gray-800">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Cover Image * (Max 5MB)
                  </label>
                  <div
                    onClick={() => coverImageInputRef.current?.click()}
                    className="w-full h-48 bg-white/10 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-all"
                  >
                    {coverImagePreview ? (
                      <Image
                        src={coverImagePreview}
                        alt="Cover preview"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover rounded-xl"
                      />
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

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Audio File * (Max 50MB)
                    <span className="block text-sm text-gray-400 font-normal">
                      Supported: MP3, WAV, OGG, FLAC, M4A, AAC, WMA
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
                    accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac,.wma"
                    onChange={handleAudioFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Initial Purchase */}
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

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              {/* Progress Display */}
              {isUploading && (
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
                  <p className="text-blue-200 mb-2">{uploadStage}</p>
                  <div className="w-full bg-blue-900/50 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-blue-300 text-sm mt-1">{uploadProgress.toFixed(0)}% complete</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading || isCreatingCoin || !coverImage || !audioFile}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isUploading || isCreatingCoin ? 'Creating Coin...' : 'Create Music Coin'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 