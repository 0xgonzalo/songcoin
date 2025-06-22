export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  cover: string;
  isPlaying: boolean;
  mcap: string; 
  vol24h: string; 
}

export interface TokenData {
  id: string;
  title: string;
  artist: string;
  genre: string;
  cover: string;
  mcap: string;
  totalVolume: string;
  creatorEarnings: string;
  priceChange: number;
  replies: number;
  creator: {
    username: string;
    avatar: string;
  };
}

// Featured tracks data for home page cards
export const featuredTracks: Track[] = [
  {
    id: "miradas",
    title: "Miradas",
    artist: "Sol Siete",
    album: "Peace Collection",
    genre: "Electronic",
    cover: "/api/placeholder/120/120",
    isPlaying: false,
    mcap: "$4.8K",
    vol24h: "$480",
  },
  {
    id: "por-amarte-asi",
    title: "Por amarte Asi",
    artist: "Nenx",
    album: "Protest",
    genre: "Hip Hop",
    cover: "/api/placeholder/120/120",
    isPlaying: false,
    mcap: "$21.6K",
    vol24h: "$2.1K",
  },
  {
    id: "vin-diesel",
    title: "Vin Diesel",
    artist: "GyiAMV",
    album: "Action",
    genre: "Trap",
    cover: "/api/placeholder/120/120",
    isPlaying: false,
    mcap: "$25.0K",
    vol24h: "$2.5K",
  },
  {
    id: "midnight-vibes",
    title: "Midnight Vibes",
    artist: "SynthWave",
    album: "Neon Dreams",
    genre: "Synthwave",
    cover: "/api/placeholder/120/120",
    isPlaying: false,
    mcap: "$15.2K",
    vol24h: "$1.8K",
  },
  {
    id: "bass-drop",
    title: "Bass Drop",
    artist: "ElectroMix",
    album: "Club Hits",
    genre: "EDM",
    cover: "/api/placeholder/120/120",
    isPlaying: false,
    mcap: "$32.1K",
    vol24h: "$3.2K",
  },
];

// Complete token data for individual token pages
export const tokenData: Record<string, TokenData> = {
  "dominga": {
    id: "dominga",
    title: "Dominga",
    artist: "santiagoruau",
    genre: "Electronic",
    cover: "/api/placeholder/400/400",
    mcap: "$191.62",
    totalVolume: "$2.53",
    creatorEarnings: "$0",
    priceChange: 5.2,
    replies: 105,
    creator: {
      username: "santiagoruau",
      avatar: "/api/placeholder/40/40"
    }
  },
  "miradas": {
    id: "miradas",
    title: "Miradas",
    artist: "Sol Siete",
    genre: "Electronic",
    cover: "/api/placeholder/400/400",
    mcap: "$4.8K",
    totalVolume: "$480",
    creatorEarnings: "$12",
    priceChange: 2.1,
    replies: 23,
    creator: {
      username: "solsiete",
      avatar: "/api/placeholder/40/40"
    }
  },
  "por-amarte-asi": {
    id: "por-amarte-asi",
    title: "Por amarte Asi",
    artist: "Nenx",
    genre: "Hip Hop",
    cover: "/api/placeholder/400/400",
    mcap: "$21.6K",
    totalVolume: "$2.1K",
    creatorEarnings: "$54",
    priceChange: 8.7,
    replies: 87,
    creator: {
      username: "nenx_music",
      avatar: "/api/placeholder/40/40"
    }
  },
  "vin-diesel": {
    id: "vin-diesel",
    title: "Vin Diesel",
    artist: "GyiAMV",
    genre: "Trap",
    cover: "/api/placeholder/400/400",
    mcap: "$25.0K",
    totalVolume: "$2.5K",
    creatorEarnings: "$62",
    priceChange: 12.3,
    replies: 156,
    creator: {
      username: "gyiamv",
      avatar: "/api/placeholder/40/40"
    }
  },
  "midnight-vibes": {
    id: "midnight-vibes",
    title: "Midnight Vibes",
    artist: "SynthWave",
    genre: "Synthwave",
    cover: "/api/placeholder/400/400",
    mcap: "$15.2K",
    totalVolume: "$1.8K",
    creatorEarnings: "$38",
    priceChange: -2.4,
    replies: 67,
    creator: {
      username: "synthwave_official",
      avatar: "/api/placeholder/40/40"
    }
  },
  "bass-drop": {
    id: "bass-drop",
    title: "Bass Drop",
    artist: "ElectroMix",
    genre: "EDM",
    cover: "/api/placeholder/400/400",
    mcap: "$32.1K",
    totalVolume: "$3.2K",
    creatorEarnings: "$81",
    priceChange: 15.6,
    replies: 203,
    creator: {
      username: "electromix_dj",
      avatar: "/api/placeholder/40/40"
    }
  },
};

export function getTokenById(tokenId: string): TokenData | null {
  return tokenData[tokenId] || null;
} 