"use client";

import React, { useState, useRef } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { Address, parseEther } from 'viem';
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
  const { connectors, connect } = useConnect();
  const { 
    createMusicCoin, 
    isCreatingCoin, 
    createCoinSuccess, 
    createdCoinAddress
  } = useZoraCoins();

  const [formState, setFormState] = useState({
    name: '',
    symbol: '',
    description: '',
    artist: address || '',
    genre: '',
    initialPurchaseWei: '0'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'uploading_audio' | 'uploading_cover' | 'uploading_metadata' | 'creating_coin'>('uploading_audio');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);

  const audioFileRef = useRef<HTMLInputElement>(null);
  const coverArtRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, audio: 'Audio file must be less than 50MB' }));
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        setErrors(prev => ({ ...prev, audio: 'Please select a valid audio file' }));
        return;
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewAudio(url);
      
      // Clear any previous errors
      setErrors(prev => ({ ...prev, audio: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image file must be less than 5MB' }));
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      
      // Clear any previous errors
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.name.trim()) newErrors.name = 'Name is required';
    if (!formState.symbol.trim()) newErrors.symbol = 'Symbol is required';
    if (!formState.description.trim()) newErrors.description = 'Description is required';
    if (!formState.genre) newErrors.genre = 'Genre is required';
    if (!audioFileRef.current?.files?.[0]) newErrors.audio = 'Audio file is required';
    if (!coverArtRef.current?.files?.[0]) newErrors.image = 'Cover art is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const audioFile = audioFileRef.current?.files?.[0];
      const imageFile = coverArtRef.current?.files?.[0];
      
      if (!audioFile || !imageFile) {
        throw new Error('Audio file and cover art are required');
      }
      
      // Upload audio file
      setUploadStage('uploading_audio');
      const audioCID = await uploadFileToIPFS(audioFile, (progress) => {
        setUploadProgress(progress * 0.3);
      });
      
      // Upload image file
      setUploadStage('uploading_cover');
      const imageCID = await uploadFileToIPFS(imageFile, (progress) => {
        setUploadProgress(30 + progress * 0.3);
      });
      
      // Create metadata
      setUploadStage('uploading_metadata');
      const metadata = {
        name: formState.name,
        description: formState.description,
        image: `ipfs://${imageCID}`,
        animation_url: `ipfs://${audioCID}`,
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
      
      const metadataURI = await uploadJSONToIPFS(metadata);
      setUploadProgress(70);
      
      // Create the coin
      setUploadStage('creating_coin');
      const coinData: CoinData = {
        name: formState.name,
        symbol: formState.symbol,
        uri: metadataURI,
        payoutRecipient: formState.artist as Address,
        initialPurchaseWei: parseEther(formState.initialPurchaseWei || '0'),
        platformReferrer: "0x32C8ACD3118766CBE5c3E45a44BCEDde953EF627"
      };
      
      await createMusicCoin(coinData);
      setUploadProgress(100);
      
    } catch (error: unknown) {
      console.error('Error creating coin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create coin';
      setErrors({ submit: errorMessage });
      setIsUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl mb-4 font-bold">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to create a music coin.
          </p>
          <button 
            onClick={() => {
              const metaMaskConnector = connectors.find(c => c.name === 'MetaMask');
              if (metaMaskConnector) {
                connect({ connector: metaMaskConnector });
              }
            }} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <LogIn size={18} />
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (createCoinSuccess && createdCoinAddress) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl mb-4 font-bold text-green-600">Coin Created Successfully!</h2>
          <p className="text-gray-600 mb-4">
            Your music coin has been created at address:
          </p>
          <code className="bg-gray-100 p-2 rounded text-sm break-all">
            {createdCoinAddress}
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Create Music Coin</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Song title"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Symbol</label>
              <input
                type="text"
                name="symbol"
                value={formState.symbol}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SONG"
              />
              {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formState.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your music..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <select
              name="genre"
              value={formState.genre}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a genre</option>
              {MUSIC_GENRES.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            {errors.genre && <p className="text-red-500 text-sm mt-1">{errors.genre}</p>}
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Audio File</label>
              <input
                ref={audioFileRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              {errors.audio && <p className="text-red-500 text-sm mt-1">{errors.audio}</p>}
              {previewAudio && (
                <audio controls className="w-full mt-2">
                  <source src={previewAudio} />
                </audio>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Cover Art</label>
              <input
                ref={coverArtRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
              {previewImage && (
                <Image 
                  src={previewImage} 
                  alt="Cover preview" 
                  width={400}
                  height={128}
                  className="w-full h-32 object-cover mt-2 rounded" 
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Initial Purchase (ETH)</label>
            <input
              type="number"
              name="initialPurchaseWei"
              value={formState.initialPurchaseWei}
              onChange={handleChange}
              step="0.001"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                <span>
                  {uploadStage === 'uploading_audio' && 'Uploading audio...'}
                  {uploadStage === 'uploading_cover' && 'Uploading cover art...'}
                  {uploadStage === 'uploading_metadata' && 'Uploading metadata...'}
                  {uploadStage === 'creating_coin' && 'Creating coin...'}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading || isCreatingCoin}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isUploading || isCreatingCoin ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Music size={18} />
                Create Music Coin
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 