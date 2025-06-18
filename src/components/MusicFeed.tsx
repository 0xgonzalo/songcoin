"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { AppHeader } from "./AppHeader";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  cover: string;
  isPlaying: boolean;
}

const mockTracks: Track[] = [
  {
    id: "1",
    title: "Orange Peel",
    artist: "Oneheart, Reidenshi",
    album: "Ambient Collection",
    genre: "Ambient",
    cover: "/api/placeholder/80/80",
    isPlaying: false,
  },
  {
    id: "2",
    title: "Snowfall",
    artist: "Oneheart",
    album: "Easy Listening",
    genre: "Ambient",
    cover: "/api/placeholder/80/80",
    isPlaying: false,
  },
  {
    id: "3",
    title: "Orange Peel",
    artist: "Oneheart, Reidenshi",
    album: "Ambient Collection",
    genre: "Ambient",
    cover: "/api/placeholder/80/80",
    isPlaying: true,
  },
  {
    id: "4",
    title: "Bonjr",
    artist: "Oneheart",
    album: "Ambient Collection",
    genre: "Ambient",
    cover: "/api/placeholder/80/80",
    isPlaying: false,
  },
];

const genres = ["Ambient", "Lo-fi", "Synthwave", "Chillhop", "Downtempo"];

export default function MusicFeed() {
  const [selectedGenre, setSelectedGenre] = useState("Ambient");
  const [tracks, setTracks] = useState(mockTracks);
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>(mockTracks.find(t => t.isPlaying));

  const togglePlay = (trackId: string) => {
    setTracks(prevTracks => 
      prevTracks.map(track => ({
        ...track,
        isPlaying: track.id === trackId ? !track.isPlaying : false
      }))
    );
    
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      setCurrentTrack(track.isPlaying ? undefined : track);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      {/* App Header */}
      <AppHeader />
      
      {/* Content Header */}
      <div className="p-4 pt-4">
        <div className="flex items-center mb-6">
          <div className="text-2xl font-bold">
            Let's<br />
            Explore <span className="text-white">Our<br />Records</span>
          </div>
          <div className="ml-auto">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Genre Selector */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Genre:</div>
          <select 
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg w-full appearance-none border border-gray-700 focus:border-gray-500 focus:outline-none"
          >
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 px-4 pb-24">
        {tracks.filter(track => track.genre === selectedGenre).map((track) => (
          <div key={track.id} className="flex items-center mb-4 p-3 rounded-lg bg-gray-900/50">
            {/* Play Button */}
            <button
              onClick={() => togglePlay(track.id)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3 hover:bg-white/20 transition-colors"
            >
              {track.isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Album Art */}
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg mr-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12c0-2.043-.766-3.905-2.026-5.314a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">{track.title}</div>
              <div className="text-sm text-gray-400 truncate">{track.artist}</div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-2">
              <button className="text-gray-400 hover:text-white transition-colors">
                <span className="text-xs">Info</span>
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg mr-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">{currentTrack.title}</div>
              <div className="text-sm text-gray-400 truncate">{currentTrack.artist}</div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-1 mb-3">
            <div className="bg-white h-1 rounded-full" style={{ width: '45%' }}></div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 9H17a1 1 0 110 2h-5.586l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 9H17a1 1 0 110 2h-5.586l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 