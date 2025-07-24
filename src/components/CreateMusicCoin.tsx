'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { Address, parseEther } from 'viem';
import { Music, Upload, Info, Clock, Disc, AudioLines, Coins, FileText, ChevronDown, CheckSquare, LogIn } from 'lucide-react';
import { useZoraCoins, CoinData } from '~/hooks/useZoraCoins';
import { uploadFileToIPFS, uploadJSONToIPFS } from '~/lib/pinataService';
import Link from 'next/link';
import Image from 'next/image';
import { ValidMetadataURI } from '@zoralabs/coins-sdk';

// Music genres for the dropdown
const MUSIC_GENRES = [
  "Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Classical", 
  "R&B", "Country", "Folk", "Metal", "Ambient", "Indie", "Other"
];

export default function CreateSongcoin() {
  const { address, isConnected } = useAccount();
  const { 
    createSongcoin, 
    isCreatingCoin, 
    createCoinSuccess, 
    createCoinError,
    createdCoinAddress
  } = useZoraCoins();
  
  const audioFileRef = useRef<HTMLInputElement>(null);
  const coverArtRef = useRef<HTMLInputElement>(null);
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [metadataCID, setMetadataCID] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading_audio' | 'uploading_cover' | 'uploading_metadata' | 'creating_coin'>('idle');
  const [audioFileName, setAudioFileName] = useState<string>('');
  
  const [formState, setFormState] = useState({
    name: '',
    symbol: '',
    description: '',
    genre: '',
    initialPurchaseWei: '0.01',
    artist: address || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { connect, connectors } = useConnect();

  // Close the genre dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
        setShowGenreDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update artist field when address changes
  useEffect(() => {
    if (address && !formState.artist) {
      setFormState(prev => ({
        ...prev,
        artist: address
      }));
    }
  }, [address, formState.artist]);

  // Track transaction status
  useEffect(() => {
    if (createCoinError) {
      setTxError(createCoinError.message);
    }
  }, [createCoinSuccess, createCoinError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSelectGenre = (genre: string) => {
    setFormState(prev => ({
      ...prev,
      genre
    }));
    setShowGenreDropdown(false);
    
    // Clear error when field is edited
    if (errors.genre) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.genre;
        return newErrors;
      });
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB > 4) {
        setErrors(prev => ({
          ...prev,
          audio: `File is too large (${fileSizeMB.toFixed(2)}MB). Maximum size is 4MB.`
        }));
        return;
      }
      
      setAudioFileName(file.name);
      
      if (errors.audio) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.audio;
          return newErrors;
        });
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB > 2) {
        setErrors(prev => ({
          ...prev,
          image: `Image is too large (${fileSizeMB.toFixed(2)}MB). Maximum size is 2MB.`
        }));
        return;
      }
      
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      
      if (errors.image) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  const triggerAudioInput = () => {
    audioFileRef.current?.click();
  };
  
  const triggerImageInput = () => {
    coverArtRef.current?.click();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.name.trim()) {
      newErrors.name = 'Track name is required';
    }
    
    if (!formState.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    } else if (formState.symbol.length > 6) {
      newErrors.symbol = 'Symbol must be 6 characters or less';
    }
    
    if (!formState.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formState.genre) {
      newErrors.genre = 'Genre is required';
    }
    
    const audioFile = audioFileRef.current?.files?.[0];
    if (!audioFile) {
      newErrors.audio = 'Audio file is required';
    } else {
      const audioSizeMB = audioFile.size / (1024 * 1024);
      if (audioSizeMB > 4) {
        newErrors.audio = `Audio file is too large (${audioSizeMB.toFixed(2)}MB). Maximum size is 4MB.`;
      }
    }
    
    const imageFile = coverArtRef.current?.files?.[0];
    if (!imageFile) {
      newErrors.image = 'Cover art is required';
    } else {
      const imageSizeMB = imageFile.size / (1024 * 1024);
      if (imageSizeMB > 2) {
        newErrors.image = `Cover art is too large (${imageSizeMB.toFixed(2)}MB). Maximum size is 2MB.`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setTxError(null);
      
      const audioFile = audioFileRef.current?.files?.[0];
      const imageFile = coverArtRef.current?.files?.[0];
      
      if (!audioFile || !imageFile) {
        setTxError('Audio file and cover art are required');
        setIsUploading(false);
        return;
      }
      
      // Upload audio file to IPFS
      setUploadStage('uploading_audio');
      const audioCID = await uploadFileToIPFS(audioFile, (progress) => {
        setUploadProgress(progress * 0.3);
      });
      
      // Upload image file to IPFS
      setUploadStage('uploading_cover');
      const imageCID = await uploadFileToIPFS(imageFile, (progress) => {
        setUploadProgress(30 + progress * 0.3);
      });
      
      // Create metadata
      setUploadStage('uploading_metadata');
      
      const cleanAudioCID = audioCID.replace('ipfs://', '');
      const cleanImageCID = imageCID.replace('ipfs://', '');
      
      // Create metadata object
      const metadata = {
        name: formState.name,
        description: formState.description,
        image: `ipfs://${cleanImageCID}`,
        external_url: `https://sonngcoin.vercel.app/coins/${formState.name.replace(/\s+/g, '-').toLowerCase()}`,
        animation_url: `ipfs://${cleanAudioCID}`,
        properties: {},
        attributes: [
          {
            trait_type: "Artist",
            value: formState.artist
          },
          {
            trait_type: "Genre",
            value: formState.genre
          },
          {
            trait_type: "Type",
            value: "Music"
          }
        ]
      };
      
      // Upload metadata to IPFS
      const metadataURI = await uploadJSONToIPFS(metadata);
      
      if (!metadataURI || !metadataURI.startsWith('ipfs://')) {
        throw new Error('Failed to get valid metadata URI from IPFS');
      }
      
      setMetadataCID(metadataURI);
      
      setUploadProgress(70);
      
      // Create the coin data
      setUploadStage('creating_coin');
      const initialPurchaseAmount = parseEther(formState.initialPurchaseWei || '0');
      
      const coinData: CoinData = {
        name: formState.name,
        symbol: formState.symbol,
        uri: metadataURI as ValidMetadataURI,
        payoutRecipient: formState.artist as Address,
        initialPurchaseWei: initialPurchaseAmount,
        platformReferrer: "0x79166ff20D3C3276b42eCE079a50C30b603167a6" as Address
      };
      
      // Create the coin
      await createSongcoin(coinData);
      
      setUploadProgress(100);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      let userFriendlyMessage = `Failed to create coin: ${errorMessage}`;
      
      if (errorMessage.includes('rejected') || errorMessage.includes('user denied')) {
        userFriendlyMessage = 'Transaction was cancelled by the user.';
      } else if (errorMessage.includes('cannot estimate gas')) {
        userFriendlyMessage = 'Failed to estimate gas. The blockchain network may be congested.';
      }
      
      setTxError(userFriendlyMessage);
      setIsUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl max-w-2xl mx-auto">
          <div className="p-8 text-center">
            <div className="text-purple-500 text-5xl mb-6">
              <Coins size={64} className="mx-auto" />
            </div>
            <h2 className="text-2xl mb-4 font-bold text-white">Wallet Connection Required</h2>
            <p className="text-gray-400 mb-6">
              Please connect your wallet to create a Songcoin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  // Find the MetaMask connector and connect with it
                  const metaMaskConnector = connectors.find(c => c.name === 'MetaMask');
                  if (metaMaskConnector) {
                    connect({ connector: metaMaskConnector });
                  }
                }} 
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <LogIn size={18} className="mr-2" />
                <span>Connect Wallet</span>
              </button>
              <Link href="/coins" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center">
                <span>Back to Coins</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Create Your Songcoin</h1>
            <p className="text-gray-400 text-lg">
              Transform your music into a tradeable token on the blockchain
            </p>
          </div>

          {/* Success State */}
          {createCoinSuccess && (
            <div className="bg-green-900/50 border border-green-600 rounded-xl p-6 mb-8">
              <div className="flex items-center mb-4">
                <CheckSquare className="text-green-400 mr-3" size={24} />
                <h3 className="text-xl font-semibold text-white">Coin Created Successfully!</h3>
              </div>
              <p className="text-green-200 mb-4">
                Your songcoin has been successfully created and deployed to the blockchain.
              </p>
              {createdCoinAddress && (
                <div className="bg-green-800/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-200 mb-2">Coin Address:</p>
                  <p className="font-mono text-green-100 break-all">{createdCoinAddress}</p>
                  {metadataCID && (
                    <>
                      <p className="text-sm text-green-200 mb-2 mt-3">Metadata IPFS Hash:</p>
                      <p className="font-mono text-green-100 break-all">{metadataCID}</p>
                    </>
                  )}
                </div>
              )}
              <div className="flex gap-4">
                <Link 
                  href="/coins" 
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  View All Coins
                </Link>
                <button 
                  onClick={() => {
                    // Reset form
                    setFormState({
                      name: '',
                      symbol: '',
                      description: '',
                      genre: '',
                      initialPurchaseWei: '0.01',
                      artist: address || '',
                    });
                    setPreviewImage(null);
                    setMetadataCID(null);
                    setAudioFileName('');
                    setErrors({});
                    if (audioFileRef.current) audioFileRef.current.value = '';
                    if (coverArtRef.current) coverArtRef.current.value = '';
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info Section */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <FileText className="mr-3" size={24} />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Track Name */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Track Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Enter your track name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Symbol */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    name="symbol"
                    value={formState.symbol}
                    onChange={handleChange}
                    placeholder="e.g. SONG"
                    maxLength={6}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 uppercase"
                  />
                  {errors.symbol && (
                    <p className="text-red-400 text-sm mt-1">{errors.symbol}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-white font-medium mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  placeholder="Describe your track and what makes it special..."
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Genre */}
              <div className="mt-6" ref={genreDropdownRef}>
                <label className="block text-white font-medium mb-2">
                  Genre *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-left focus:outline-none focus:border-purple-500 flex items-center justify-between"
                  >
                    <span className={formState.genre ? 'text-white' : 'text-gray-400'}>
                      {formState.genre || 'Select a genre'}
                    </span>
                    <ChevronDown 
                      size={20} 
                      className={`transform transition-transform ${showGenreDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {showGenreDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {MUSIC_GENRES.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleSelectGenre(genre)}
                          className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors"
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.genre && (
                  <p className="text-red-400 text-sm mt-1">{errors.genre}</p>
                )}
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Upload className="mr-3" size={24} />
                Media Upload
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Audio Upload */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Audio File *
                  </label>
                  <div
                    onClick={triggerAudioInput}
                    className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    {audioFileName ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-2">
                          <AudioLines className="text-purple-400" size={24} />
                          <span className="text-white">Audio Ready</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                          <Clock size={16} className="inline mr-1" />
                          {audioFileName}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Music className="mx-auto text-gray-400" size={48} />
                        <p className="text-gray-400">Click to upload audio file</p>
                        <p className="text-gray-500 text-sm">MP3, WAV, or other audio formats (Max 4MB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={audioFileRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="hidden"
                  />
                  {errors.audio && (
                    <p className="text-red-400 text-sm mt-1">{errors.audio}</p>
                  )}
                </div>

                {/* Cover Art Upload */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Cover Art *
                  </label>
                  <div
                    onClick={triggerImageInput}
                    className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors h-[200px] flex items-center justify-center"
                  >
                    {previewImage ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={previewImage}
                          alt="Cover art preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Disc className="mx-auto text-gray-400" size={48} />
                        <p className="text-gray-400">Click to upload cover art</p>
                        <p className="text-gray-500 text-sm">JPG, PNG, or GIF (Max 2MB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={coverArtRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {errors.image && (
                    <p className="text-red-400 text-sm mt-1">{errors.image}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Creating Your Coin</span>
                    <span className="text-gray-400">{uploadProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    {uploadStage === 'uploading_audio' && 'Uploading audio file to IPFS...'}
                    {uploadStage === 'uploading_cover' && 'Uploading cover art to IPFS...'}
                    {uploadStage === 'uploading_metadata' && 'Uploading metadata to IPFS...'}
                    {uploadStage === 'creating_coin' && 'Creating coin on blockchain...'}
                  </p>
                </div>
              )}

              {/* Error Display */}
              {txError && (
                <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <Info className="text-red-400 mr-2" size={20} />
                    <span className="text-red-400 font-medium">Error</span>
                  </div>
                  <p className="text-red-200 text-sm">{txError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading || isCreatingCoin}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isUploading || isCreatingCoin ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {isUploading ? 'Uploading...' : 'Creating Coin...'}
                  </>
                ) : (
                  <>
                    <Coins className="mr-3" size={20} />
                    Create Songcoin
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 