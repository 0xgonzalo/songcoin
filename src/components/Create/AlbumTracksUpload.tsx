import React, { useRef } from 'react';
import { Music, Plus, X } from 'lucide-react';
import { Track } from './types';

interface AlbumTracksUploadProps {
  tracks: Track[];
  addTrack: () => void;
  removeTrack: (trackId: string) => void;
  updateTrackName: (trackId: string, name: string) => void;
  handleTrackFileChange: (trackId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AlbumTracksUpload({
  tracks,
  addTrack,
  removeTrack,
  updateTrackName,
  handleTrackFileChange
}: AlbumTracksUploadProps) {
  const trackFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <label className="block text-white font-semibold">
          Tracks * (Max 50MB each)
          <span className="block text-sm text-gray-400 font-normal">
            Supported: MP3, WAV, OGG, AAC, M4A, FLAC
          </span>
        </label>
        <button
          type="button"
          onClick={addTrack}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Track
        </button>
      </div>
      
      <div className="space-y-4">
        {tracks.map((track, index) => (
          <div key={track.id} className="bg-white/5 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-semibold">Track {index + 1}</h3>
              {tracks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTrack(track.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-white font-semibold mb-2">
                  Track Name *
                </label>
                <input
                  type="text"
                  value={track.name}
                  onChange={(e) => updateTrackName(track.id, e.target.value)}
                  placeholder="Enter track name"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-white font-semibold mb-2">
                  Audio File *
                </label>
                <div
                  onClick={() => trackFileInputRefs.current[track.id]?.click()}
                  className="w-full h-24 bg-white/10 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all"
                >
                  {track.file ? (
                    <div className="text-center">
                      <Music className="w-6 h-6 text-green-400 mb-1 mx-auto" />
                      <p className="text-white font-semibold text-sm">{track.file.name}</p>
                      <p className="text-gray-400 text-xs">
                        {(track.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Music className="w-6 h-6 text-gray-400 mb-1 mx-auto" />
                      <p className="text-gray-400 text-sm">Click to upload</p>
                    </div>
                  )}
                </div>
                <input
                  ref={(el) => { trackFileInputRefs.current[track.id] = el; }}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.aac,.m4a,.flac,.wma"
                  onChange={(e) => handleTrackFileChange(track.id, e)}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 