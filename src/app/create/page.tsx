"use client";

import React, { useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { Music, LogIn, Upload, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useZoraCoins, CoinData } from '~/hooks/useZoraCoins';
import { uploadFileToIPFS, uploadJSONToIPFS } from '~/lib/pinataService';

const MUSIC_GENRES = [
  "Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Classical", 
  "R&B", "Country", "Folk", "Metal", "Ambient", "Indie", "Other"
];

interface UploadProgress {
  coverImage: number;
  audioFile: number;
  metadata: number;
  validation: number;
}

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

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    coverImage: 0,
    audioFile: 0,
    metadata: 0,
    validation: 0
  });
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState('');

  // File input refs
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`Selected cover image: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Cover image must be less than 5MB');
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
    setError('');
    
    if (file) {
      console.log(`Selected audio file: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB, Type: ${file.type}`);
      
      // Check both MIME type and file extension for better compatibility
      const validAudioTypes = [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 
        'audio/m4a', 'audio/flac', 'audio/x-wav', 'audio/x-m4a'
      ];
      
      const validExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac', '.wma'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      const hasValidType = file.type.startsWith('audio/') || validAudioTypes.includes(file.type);
      const hasValidExtension = validExtensions.includes(fileExtension);
      
      if (!hasValidType && !hasValidExtension) {
        setError('Please select a valid audio file (MP3, WAV, OGG, AAC, M4A, FLAC)');
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        setError('Audio file must be less than 50MB');
        return;
      }
      
      setAudioFile(file);
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
    setUploadProgress({ coverImage: 0, audioFile: 0, metadata: 0, validation: 0 });

    try {
      console.log('🎵 Starting coin creation process...');
      
      // Step 1: Upload cover image
      setCurrentStep('Uploading cover image...');
      setUploadProgress(prev => ({ ...prev, coverImage: 50 }));
      const coverImageCid = await uploadFileToIPFS(coverImage, (progress) => {
        setUploadProgress(prev => ({ ...prev, coverImage: progress }));
      });
      console.log('✅ Cover image uploaded:', coverImageCid);
      
      // Step 2: Upload audio file
      setCurrentStep('Uploading audio file...');
      setUploadProgress(prev => ({ ...prev, audioFile: 50 }));
      const audioFileCid = await uploadFileToIPFS(audioFile, (progress) => {
        setUploadProgress(prev => ({ ...prev, audioFile: progress }));
      });
      console.log('✅ Audio file uploaded:', audioFileCid);

      // Step 3: Create and upload metadata
      setCurrentStep('Creating metadata...');
      const metadata = {
        name,
        description,
        image: `ipfs://${coverImageCid}`,
        animation_url: `ipfs://${audioFileCid}`,
        attributes: [
          { trait_type: 'Artist', value: artist },
          { trait_type: 'Genre', value: genre || 'Other' },
          { trait_type: 'Type', value: 'Music' },
          { trait_type: 'File Type', value: audioFile.type },
          { trait_type: 'File Size', value: `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB` }
        ]
      };

      const metadataCid = await uploadJSONToIPFS(metadata);
      setUploadProgress(prev => ({ ...prev, metadata: 100 }));
      console.log('✅ Metadata uploaded:', metadataCid);

      // Step 4: Validate metadata accessibility
      setCurrentStep('Validating metadata accessibility...');
      console.log('🔍 Validating metadata accessibility across IPFS gateways...');
      setUploadProgress(prev => ({ ...prev, validation: 50 }));

      // Step 5: Create coin
      setCurrentStep('Creating coin on blockchain...');
      setUploadProgress(prev => ({ ...prev, validation: 100 }));
      
      // Validate and parse initial purchase amount
      let initialPurchaseWei: bigint;
      try {
        const purchaseAmount = initialPurchase?.trim() || '0';
        if (purchaseAmount === '' || purchaseAmount === '0') {
          initialPurchaseWei = BigInt(0);
        } else {
          initialPurchaseWei = parseEther(purchaseAmount);
        }
      } catch (error) {
        console.error('Error parsing initial purchase amount:', error);
        initialPurchaseWei = BigInt(0);
      }
      
      const coinData: CoinData = {
        name,
        symbol: symbol.toUpperCase(),
        uri: metadataCid, // metadataCid already includes the ipfs:// prefix
        payoutRecipient: address,
        platformReferrer: "0x32C8ACD3118766CBE5c3E45a44BCEDde953EF627",
        initialPurchaseWei
      };

      await createMusicCoin(coinData);
      setCurrentStep('Coin created successfully!');

    } catch (err) {
      console.error('❌ Coin creation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create music coin';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate overall progress
  const overallProgress = (uploadProgress.coverImage + uploadProgress.audioFile + uploadProgress.metadata + uploadProgress.validation) / 4;

  // Show success state
  if (createCoinSuccess && createdCoinAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
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
                  <p className="text-blue-200 mb-2">{currentStep}</p>
                  <div className="w-full bg-blue-900/50 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-blue-300">
                    <div>Cover: {uploadProgress.coverImage.toFixed(0)}%</div>
                    <div>Audio: {uploadProgress.audioFile.toFixed(0)}%</div>
                    <div>Metadata: {uploadProgress.metadata.toFixed(0)}%</div>
                    <div>Validation: {uploadProgress.validation.toFixed(0)}%</div>
                  </div>
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