import React from 'react';
import { CreateMode, MUSIC_GENRES } from './types';

interface BasicInfoFormProps {
  createMode: CreateMode;
  name: string;
  setName: (name: string) => void;
  symbol: string;
  setSymbol: (symbol: string) => void;
  description: string;
  setDescription: (description: string) => void;
  artist: string;
  setArtist: (artist: string) => void;
  genre: string;
  setGenre: (genre: string) => void;
}

export default function BasicInfoForm({
  createMode,
  name,
  setName,
  symbol,
  setSymbol,
  description,
  setDescription,
  artist,
  setArtist,
  genre,
  setGenre
}: BasicInfoFormProps) {
  return (
    <>
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-semibold mb-2">
            {createMode === 'single' ? 'Song' : 'Album'} Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={createMode === 'single' ? 'e.g., My Amazing Song' : 'e.g., My Amazing Album'}
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
            placeholder={createMode === 'single' ? 'e.g., SONG' : 'e.g., ALBUM'}
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
          placeholder={createMode === 'single' ? 'Describe your music...' : 'Describe your album...'}
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
    </>
  );
} 