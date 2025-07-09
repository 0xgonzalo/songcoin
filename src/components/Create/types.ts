export interface UploadProgress {
  coverImage: number;
  audioFile: number;
  metadata: number;
  validation: number;
}

export interface Track {
  id: string;
  name: string;
  file: File | null;
}

export type CreateMode = 'single' | 'album';

export const MUSIC_GENRES = [
  "Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Classical", 
  "R&B", "Country", "Folk", "Metal", "Ambient", "Indie", "Other"
]; 