"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { type Track } from "~/lib/tracks";

interface AudioPlayerContextProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  play: (track: Track) => void;
  pause: () => void;
  toggle: (track: Track) => void;
  seek: (time: number) => void;
  progress: number;
  duration: number;
}

const AudioPlayerContext = createContext<AudioPlayerContextProps | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play a new track
  const play = useCallback((track: Track) => {
    if (!track.audio) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  // Pause playback
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  // Toggle play/pause for a track
  const toggle = useCallback((track: Track) => {
    if (currentTrack && currentTrack.id === track.id) {
      if (isPlaying) pause();
      else setIsPlaying(true);
    } else {
      play(track);
    }
  }, [currentTrack, isPlaying, play, pause]);

  // Seek to a time
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  // Handle audio element events
  useEffect(() => {
    if (!currentTrack || !currentTrack.audio) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.audio);
    } else {
      audioRef.current.src = currentTrack.audio;
    }
    const audio = audioRef.current;
    audio.currentTime = 0;
    if (isPlaying) audio.play();
    else audio.pause();

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack, isPlaying]);

  // Pause audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <AudioPlayerContext.Provider value={{ currentTrack, isPlaying, play, pause, toggle, seek, progress, duration }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
} 