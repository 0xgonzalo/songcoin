"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAccount, useConnect } from "wagmi";
import { Address, parseEther } from "viem";
import { useMiniApp } from "@neynar/react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { uploadFileToIPFS, uploadJSONToIPFS } from "~/lib/pinataService";
import { useZoraCoins, CoinData } from "~/hooks/useZoraCoins";

// Genre options matching the home page
const genres = ["Ambient", "Lo-fi", "Synthwave", "Chillhop", "Downtempo"];

interface CoinMetadata {
  name: string;
  symbol: string;
  description: string;
  genre: string;
  imageFile: File | null;
  audioFile: File | null;
}

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  verified_addresses?: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
}

export default function CreatePage() {
  const router = useRouter();
  const { context } = useMiniApp();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { createMusicCoin } = useZoraCoins();
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const [metadata, setMetadata] = useState<CoinMetadata>({
    name: "",
    symbol: "",
    description: "",
    genre: genres[0],
    imageFile: null,
    audioFile: null,
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading_image' | 'uploading_audio' | 'uploading_metadata' | 'creating_coin'>('idle');
  const [neynarUser, setNeynarUser] = useState<NeynarUser | null>(null);
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);

  // State for immediate file uploads
  const [imageCID, setImageCID] = useState<string | null>(null);
  const [audioCID, setAudioCID] = useState<string | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Development mode: use a test FID when not in Farcaster context
  const isDev = process.env.NODE_ENV === 'development';
  const testFid = 3; // Dan Romero's FID for testing
  const effectiveFid = context?.user?.fid || (isDev ? testFid : null);

  // Get the effective wallet address - prefer Wagmi connected wallet, fallback to Farcaster verified address
  const farcasterUserAddress = neynarUser?.verified_addresses?.eth_addresses?.[0] as Address | undefined;
  const effectiveAddress = address || farcasterUserAddress;
  const isWalletAvailable = isConnected || !!farcasterUserAddress;

  // Auto-connect Farcaster wallet when available
  useEffect(() => {
    if (!autoConnectAttempted && !isConnected && context?.user?.fid && farcasterUserAddress) {
      const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame');
      if (farcasterConnector) {
        console.log('Auto-connecting Farcaster wallet for create page...');
        connect({ connector: farcasterConnector });
        setAutoConnectAttempted(true);
      }
    }
  }, [context?.user?.fid, farcasterUserAddress, isConnected, connectors, connect, autoConnectAttempted]);

  // Fetch Neynar user data when context is available
  useEffect(() => {
    const fetchNeynarUserData = async () => {
      if (effectiveFid) {
        try {
          const response = await fetch(`/api/users?fids=${effectiveFid}`);
          const data = await response.json();
          
          if (data.users?.[0]) {
            setNeynarUser(data.users[0]);
          }
        } catch (error) {
          console.error('Failed to fetch Neynar user data:', error);
        }
      }
    };
    fetchNeynarUserData();
  }, [effectiveFid]);

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear previous errors and CID
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.imageFile;
        return newErrors;
      });
      setImageCID(null);
      setImageUploadProgress(0);

      // Start immediate upload
      setIsUploadingImage(true);
      try {
        console.log('Starting immediate image upload...');
        const cid = await uploadFileToIPFS(file, (progress) => {
          setImageUploadProgress(progress);
        });
        setImageCID(cid);
        console.log('Image uploaded immediately with CID:', cid);
        console.log('Image file accessible at:', `https://gateway.pinata.cloud/ipfs/${cid}`);
      } catch (error) {
        console.error('Immediate image upload failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setErrors(prev => ({ ...prev, imageFile: errorMessage }));
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav)$/i)) {
        setErrors(prev => ({ ...prev, audioFile: 'Please select a valid audio file (.mp3 or .wav)' }));
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, audioFile: 'Audio file size must be less than 100MB' }));
        return;
      }

      setMetadata(prev => ({ ...prev, audioFile: file }));
      
      // Clear previous errors and CID
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.audioFile;
        return newErrors;
      });
      setAudioCID(null);
      setAudioUploadProgress(0);

      // Start immediate upload
      setIsUploadingAudio(true);
      try {
        console.log('Starting immediate audio upload...');
        const cid = await uploadFileToIPFS(file, (progress) => {
          setAudioUploadProgress(progress);
        });
        setAudioCID(cid);
        console.log('Audio uploaded immediately with CID:', cid);
        console.log('Audio file accessible at:', `https://gateway.pinata.cloud/ipfs/${cid}`);
      } catch (error) {
        console.error('Immediate audio upload failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setErrors(prev => ({ ...prev, audioFile: errorMessage }));
      } finally {
        setIsUploadingAudio(false);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!metadata.name.trim()) newErrors.name = 'Track name is required';
    if (!metadata.symbol.trim()) newErrors.symbol = 'Symbol is required';
    if (!metadata.description.trim()) newErrors.description = 'Description is required';
    if (!imageCID) newErrors.imageFile = 'Cover image is required and must be uploaded';
    if (!audioCID) newErrors.audioFile = 'Audio file is required and must be uploaded';

    if (metadata.symbol && !/^[A-Z]{3,6}$/.test(metadata.symbol)) {
      newErrors.symbol = 'Symbol must be 3-6 uppercase letters';
    }

    if (!isWalletAvailable) {
      newErrors.wallet = 'Please connect your wallet or sign in with Farcaster to create a coin';
    }

    if (!effectiveAddress) {
      newErrors.wallet = 'No wallet address available. Please connect a wallet or ensure your Farcaster profile has a verified ETH address.';
    }

    // Check if uploads are still in progress
    if (isUploadingImage) {
      newErrors.imageFile = 'Please wait for image upload to complete';
    }
    
    if (isUploadingAudio) {
      newErrors.audioFile = 'Please wait for audio upload to complete';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCoin = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    setUploadProgress(0);
    
    try {
      // Files are already uploaded, use the CIDs
      console.log('Using pre-uploaded files - Image CID:', imageCID, 'Audio CID:', audioCID);

      // Create metadata object following Zora's expected format
      setUploadStage('uploading_metadata');
      setUploadProgress(70); // Skip file upload progress since files are already uploaded
      
      // Get artist name from Farcaster profile
      const artistName = neynarUser?.display_name || context?.user?.displayName || context?.user?.username || 'Unknown Artist';
      
      const metadataObject = {
        name: metadata.name,
        description: metadata.description,
        image: `ipfs://${imageCID}`,
        external_url: `https://songcoin.vercel.app/token/${metadata.name.replace(/\s+/g, '-').toLowerCase()}`,
        animation_url: `ipfs://${audioCID}`,
        properties: {
          genre: metadata.genre,
          artist: artistName,
        },
        attributes: [
          {
            trait_type: "Artist",
            value: artistName
          },
          {
            trait_type: "Genre", 
            value: metadata.genre
          },
          {
            trait_type: "Type",
            value: "Music"
          }
        ]
      };

      // Upload metadata to IPFS
      const metadataURI = await uploadJSONToIPFS(metadataObject);
      console.log('Metadata uploaded with URI:', metadataURI);
      
      setUploadProgress(80);

      // Create the coin data for Zora
      setUploadStage('creating_coin');
      
      const coinData: CoinData = {
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadataURI,
        payoutRecipient: effectiveAddress as Address,
        platformReferrer: "0x32C8ACD3118766CBE5c3E45a44BCEDde953EF627"
      };

      // Create the coin using Zora SDK
      const result = await createMusicCoin(coinData);
      
      setUploadProgress(100);
      
      console.log('Coin created successfully:', result);
      
      // Redirect to success page or coin page
      if (result?.address) {
        router.push(`/token/${result.address}`);
      } else {
        router.push('/');
      }
      
    } catch (error: unknown) {
      console.error('Error creating coin:', error);
      
      let errorMessage = 'Failed to create coin. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed')) {
          errorMessage = 'Pinata authentication failed. Please check your API configuration.';
        } else if (error.message.includes('File too large')) {
          errorMessage = 'One of your files is too large. Please use smaller files.';
        } else if (error.message.includes('user rejected') || error.message.includes('user denied')) {
          errorMessage = 'Transaction was cancelled.';
        } else if (error.message.includes('Wallet not connected')) {
          errorMessage = 'Please connect your wallet to create a coin.';
        } else if (error.message.includes('Cannot convert 0x to a BigInt')) {
          errorMessage = 'Wallet address validation failed. Please try reconnecting your wallet.';
        } else if (error.message.includes('Invalid payout recipient address')) {
          errorMessage = 'Invalid wallet address. Please reconnect your wallet and try again.';
        } else {
          // Include the actual error message for debugging
          errorMessage = `Failed to create coin: ${error.message}`;
        }
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsCreating(false);
      setUploadStage('idle');
    }
  };

  const getStageText = () => {
    switch (uploadStage) {
      case 'uploading_image':
        return 'Uploading cover image...';
      case 'uploading_audio':
        return 'Uploading audio file...';
      case 'uploading_metadata':
        return 'Uploading metadata...';
      case 'creating_coin':
        return 'Creating coin on blockchain...';
      default:
        return 'Creating Music Coin';
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

      {!isWalletAvailable && (
        <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg">
          <p className="text-yellow-200 text-sm mb-3">
            {context?.user ? 
              'Please ensure your Farcaster profile has a verified ETH address, or connect a wallet to create a music coin.' :
              'Please connect your wallet or sign in with Farcaster to create a music coin.'
            }
          </p>
          <div className="flex gap-2 flex-wrap">
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                onClick={() => connect({ connector })}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1"
              >
                Connect {connector.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {isWalletAvailable && effectiveAddress && (
        <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg">
          <p className="text-green-200 text-sm">
            ✅ Wallet connected: {effectiveAddress.slice(0, 6)}...{effectiveAddress.slice(-4)}
            {farcasterUserAddress && !isConnected && (
              <span className="block text-xs text-green-300 mt-1">
                Using Farcaster verified address
              </span>
            )}
          </p>
          <p className="text-green-200 text-sm mt-2">
            🎵 Artist: {neynarUser?.display_name || context?.user?.displayName || context?.user?.username || 'Unknown Artist'}
            <span className="block text-xs text-green-300 mt-1">
              Artist name from your Farcaster profile
            </span>
          </p>
          {farcasterUserAddress && !isConnected && (
            <div className="mt-2">
              <Button
                onClick={() => {
                  const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame');
                  if (farcasterConnector) {
                    connect({ connector: farcasterConnector });
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
              >
                Connect Farcaster Wallet for Signing
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        {/* Cover Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="image-upload" className="text-white font-medium">
            Cover Image *
          </Label>
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition-colors"
            onClick={() => !isUploadingImage && imageInputRef.current?.click()}
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
                <div className="mt-2 space-y-1">
                  {isUploadingImage ? (
                    <div className="space-y-2">
                      <p className="text-sm text-blue-400">Uploading image...</p>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${imageUploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400">{Math.round(imageUploadProgress)}%</p>
                    </div>
                  ) : imageCID ? (
                    <div className="space-y-1">
                      <p className="text-sm text-green-400">✅ Uploaded to IPFS</p>
                      <a 
                        href={`https://gateway.pinata.cloud/ipfs/${imageCID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        View on IPFS
                      </a>
                      <p className="text-xs text-gray-400">Click to change image</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Click to change image</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
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
            disabled={isUploadingImage}
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
            onClick={() => !isUploadingAudio && audioInputRef.current?.click()}
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
                {isUploadingAudio ? (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-400">Uploading audio...</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${audioUploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">{Math.round(audioUploadProgress)}%</p>
                  </div>
                ) : audioCID ? (
                  <div className="space-y-1">
                    <p className="text-sm text-green-400">✅ Uploaded to IPFS</p>
                    <a 
                      href={`https://gateway.pinata.cloud/ipfs/${audioCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      View on IPFS
                    </a>
                    <p className="text-xs text-gray-500">Click to change file</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Click to change file</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <p className="text-gray-400">Click to upload audio file</p>
                <p className="text-xs text-gray-500">MP3, WAV up to 100MB</p>
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
            disabled={isUploadingAudio}
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

        {/* Genre */}
        <div className="space-y-2">
          <Label htmlFor="genre" className="text-white font-medium">
            Genre *
          </Label>
          <select
            id="genre"
            value={metadata.genre}
            onChange={(e) => handleInputChange('genre', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:border-purple-500 focus:outline-none"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
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
            placeholder="Describe your track..."
            value={metadata.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:border-purple-500 focus:outline-none resize-none"
            rows={3}
          />
          {errors.description && (
            <p className="text-red-400 text-sm">{errors.description}</p>
          )}
        </div>

        {/* Progress Bar */}
        {isCreating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{getStageText()}</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {errors.general && (
          <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg">
            <p className="text-red-200 text-sm">{errors.general}</p>
          </div>
        )}

        {errors.wallet && (
          <div className="p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg">
            <p className="text-yellow-200 text-sm">{errors.wallet}</p>
          </div>
        )}

        {/* Create Button */}
        <Button
          onClick={handleCreateCoin}
          disabled={isCreating || !isConnected}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {isCreating ? getStageText() : 'Create Music Coin'}
        </Button>
      </div>
    </main>
  );
} 