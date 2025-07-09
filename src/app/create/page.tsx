"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { parseEther, Address } from 'viem';
import { LogIn } from 'lucide-react';
import { useZoraCoins, CoinData } from '~/hooks/useZoraCoins';
import { uploadFileToIPFS, uploadJSONToIPFS } from '~/lib/pinataService';
import { ValidMetadataURI } from '@zoralabs/coins-sdk';
import {
  CreateModeToggle,
  BasicInfoForm,
  CoverImageUpload,
  SingleTrackUpload,
  AlbumTracksUpload,
  InitialPurchaseInput,
  ErrorDisplay,
  UploadProgressDisplay,
  SuccessScreen,
  CreateSubmitButton,
  CreateMode,
  Track,
  UploadProgress
} from '~/components/Create';

export default function CreatePage() {
  const { address, isConnected } = useAccount();
  const { 
    createMusicCoin, 
    isCreatingCoin, 
    createCoinSuccess,
    createdCoinAddress
  } = useZoraCoins();

  // Mode state
  const [createMode, setCreateMode] = useState<CreateMode>('single');

  // Form state (shared)
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [initialPurchase, setInitialPurchase] = useState('0.0001');

  // Single track state
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Album state
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', name: '', file: null }
  ]);

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

  // Track management functions
  const addTrack = () => {
    const newTrack: Track = {
      id: Date.now().toString(),
      name: '',
      file: null
    };
    setTracks([...tracks, newTrack]);
  };

  const removeTrack = (trackId: string) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter(track => track.id !== trackId));
    }
  };

  const updateTrackName = (trackId: string, name: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, name } : track
    ));
  };

  const updateTrackFile = (trackId: string, file: File | null) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, file } : track
    ));
  };

  const handleTrackFileChange = (trackId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`Selected track file: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      
      // Validate file type and size (same as single track)
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
      
      updateTrackFile(trackId, file);
      setError('');
    }
  };

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

    if (!coverImage) {
      setError('Please select a cover image');
      return;
    }

    if (!name || !symbol || !description || !artist) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate based on mode
    if (createMode === 'single') {
      if (!audioFile) {
        setError('Please select an audio file');
        return;
      }
    } else {
      // Album mode validation
      if (tracks.length === 0) {
        setError('Please add at least one track');
        return;
      }
      
      const emptyTracks = tracks.filter(track => !track.file || !track.name.trim());
      if (emptyTracks.length > 0) {
        setError('Please provide names and files for all tracks');
        return;
      }
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
      
      // Step 2: Upload audio files
      setCurrentStep(`Uploading ${createMode === 'single' ? 'audio file' : 'tracks'}...`);
      setUploadProgress(prev => ({ ...prev, audioFile: 50 }));

      let audioContent: string | string[] = '';
      let totalSize = 0;

      if (createMode === 'single') {
        const audioFileCid = await uploadFileToIPFS(audioFile!, (progress) => {
        setUploadProgress(prev => ({ ...prev, audioFile: progress }));
      });
        audioContent = audioFileCid;
        totalSize = audioFile!.size;
      console.log('✅ Audio file uploaded:', audioFileCid);
      } else {
        // Album mode: upload all tracks
        const trackCids: string[] = [];
        const trackCount = tracks.length;
        
        for (let i = 0; i < trackCount; i++) {
          const track = tracks[i];
          if (track.file) {
            setCurrentStep(`Uploading track ${i + 1} of ${trackCount}...`);
            const trackCid = await uploadFileToIPFS(track.file, (progress) => {
              const overallProgress = ((i / trackCount) * 100) + (progress / trackCount);
              setUploadProgress(prev => ({ ...prev, audioFile: overallProgress }));
            });
            trackCids.push(trackCid);
            totalSize += track.file.size;
            console.log(`✅ Track ${i + 1} uploaded:`, trackCid);
          }
        }
        audioContent = trackCids;
      }

      // Step 3: Create and upload metadata
      setCurrentStep('Creating metadata...');
      let metadata;
      
      if (createMode === 'single') {
        metadata = {
        name,
        description,
        image: `ipfs://${coverImageCid}`,
          animation_url: `ipfs://${audioContent}`,
        attributes: [
          { trait_type: 'Artist', value: artist },
          { trait_type: 'Genre', value: genre || 'Other' },
          { trait_type: 'Type', value: 'Music' },
            { trait_type: 'File Type', value: audioFile!.type },
            { trait_type: 'File Size', value: `${(audioFile!.size / (1024 * 1024)).toFixed(2)} MB` }
          ]
        };
      } else {
        metadata = {
          name,
          description,
          image: `ipfs://${coverImageCid}`,
          attributes: [
            { trait_type: 'Artist', value: artist },
            { trait_type: 'Genre', value: genre || 'Other' },
            { trait_type: 'Type', value: 'Album' },
            { trait_type: 'Track Count', value: tracks.length.toString() },
            { trait_type: 'Total Size', value: `${(totalSize / (1024 * 1024)).toFixed(2)} MB` }
          ],
          tracks: tracks.map((track, index) => ({
            name: track.name,
            animation_url: `ipfs://${(audioContent as string[])[index]}`,
            track_number: index + 1
          }))
        };
      }

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
        uri: metadataCid as ValidMetadataURI, // metadataCid already includes the ipfs:// prefix
        payoutRecipient: address,
        platformReferrer: "0x79166ff20D3C3276b42eCE079a50C30b603167a6" as Address,
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

  // Show success state
  if (createCoinSuccess && createdCoinAddress) {
    return (
      <SuccessScreen
        createMode={createMode}
        createdCoinAddress={createdCoinAddress}
        onCreateAnother={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
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
            <CreateModeToggle
              createMode={createMode}
              setCreateMode={setCreateMode}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              <BasicInfoForm
                createMode={createMode}
                name={name}
                setName={setName}
                symbol={symbol}
                setSymbol={setSymbol}
                description={description}
                setDescription={setDescription}
                artist={artist}
                setArtist={setArtist}
                genre={genre}
                setGenre={setGenre}
              />

              <CoverImageUpload
                coverImagePreview={coverImagePreview}
                handleCoverImageChange={handleCoverImageChange}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />

              {createMode === 'single' && (
                <SingleTrackUpload
                  audioFile={audioFile}
                  handleAudioFileChange={handleAudioFileChange}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
              )}

              {createMode === 'album' && (
                <AlbumTracksUpload
                  tracks={tracks}
                  addTrack={addTrack}
                  removeTrack={removeTrack}
                  updateTrackName={updateTrackName}
                  handleTrackFileChange={handleTrackFileChange}
                />
              )}

              <InitialPurchaseInput
                initialPurchase={initialPurchase}
                setInitialPurchase={setInitialPurchase}
              />

              <ErrorDisplay error={error} />

              <UploadProgressDisplay
                isUploading={isUploading}
                currentStep={currentStep}
                uploadProgress={uploadProgress}
                createMode={createMode}
              />

              <CreateSubmitButton
                isUploading={isUploading}
                isCreatingCoin={isCreatingCoin}
                coverImage={coverImage}
                audioFile={audioFile}
                tracks={tracks}
                createMode={createMode}
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 