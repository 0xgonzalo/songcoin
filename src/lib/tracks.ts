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
  audio?: string;
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
  audio?: string;
}

// Featured tracks data for home page cards
export const featuredTracks: Track[] = [
  {
    id: "miradas",
    title: "Miradas",
    artist: "Sol Siete",
    album: "Peace Collection",
    genre: "Electronic",
    cover: "/placeholders/1.jpg",
    isPlaying: false,
    mcap: "$4.8K",
    vol24h: "$480",
    audio: "/music/WhoMadeWho & Blue Hawaii - Sweet Cuddles (Selim Sivade, Baron FR, Meloko, Konvex FR Remix).mp3"
  },
  {
    id: "por-amarte-asi",
    title: "Por amarte Asi",
    artist: "Nenx",
    album: "Protest",
    genre: "Hip Hop",
    cover: "/placeholders/2.jpg",
    isPlaying: false,
    mcap: "$21.6K",
    vol24h: "$2.1K",
    audio: "/music/Volon - Going Up (Original Mix).mp3"
  },
  {
    id: "vin-diesel",
    title: "Vin Diesel",
    artist: "GyiAMV",
    album: "Action",
    genre: "Trap",
    cover: "/placeholders/3.jpg",
    isPlaying: false,
    mcap: "$25.0K",
    vol24h: "$2.5K",
    audio: "/music/Volon - 2Pacman (Original Mix).mp3"
  },
  {
    id: "midnight-vibes",
    title: "Super Midnight Vibes",
    artist: "SynthWave",
    album: "Neon Dreams",
    genre: "Synthwave",
    cover: "/placeholders/4.jpg",
    isPlaying: false,
    mcap: "$15.2K",
    vol24h: "$1.8K",
    audio: "/music/Voch - Illusion (Extended Mix).mp3"
  },
  {
    id: "bass-drop",
    title: "Bass Drop",
    artist: "ElectroMix",
    album: "Club Hits",
    genre: "EDM",
    cover: "/placeholders/5.jpg",
    isPlaying: false,
    mcap: "$32.1K",
    vol24h: "$3.2K",
    audio: "/music/Vincent Jarroux - Phoenix.mp3"
  },
  {
    id: "dominga",
    title: "Dominga",
    artist: "santiagoruau",
    album: "",
    genre: "Electronic",
    cover: "/placeholders/6.jpg",
    isPlaying: false,
    mcap: "$191.62",
    vol24h: "$2.53",
    audio: "/music/Villamizar, Fenky, Gustavo Dominguez - Hold You (Original Mix).mp3"
  },
];

// Complete token data for individual token pages
export const tokenData: Record<string, TokenData> = {
  "dominga": {
    id: "dominga",
    title: "Dominga",
    artist: "santiagoruau",
    genre: "Electronic",
    cover: "/placeholders/6.jpg",
    mcap: "$191.62",
    totalVolume: "$2.53",
    creatorEarnings: "$0",
    priceChange: 5.2,
    replies: 105,
    creator: {
      username: "santiagoruau",
      avatar: "/icon.png"
    },
    audio: "/music/Villamizar, Fenky, Gustavo Dominguez - Hold You (Original Mix).mp3"
  },
  "miradas": {
    id: "miradas",
    title: "Miradas",
    artist: "Sol Siete",
    genre: "Electronic",
    cover: "/placeholders/1.jpg",
    mcap: "$4.8K",
    totalVolume: "$480",
    creatorEarnings: "$12",
    priceChange: 2.1,
    replies: 23,
    creator: {
      username: "solsiete",
      avatar: "/icon.png"
    },
    audio: "/music/WhoMadeWho & Blue Hawaii - Sweet Cuddles (Selim Sivade, Baron FR, Meloko, Konvex FR Remix).mp3"
  },
  "por-amarte-asi": {
    id: "por-amarte-asi",
    title: "Por amarte Asi",
    artist: "Nenx",
    genre: "Hip Hop",
    cover: "/placeholders/2.jpg",
    mcap: "$21.6K",
    totalVolume: "$2.1K",
    creatorEarnings: "$54",
    priceChange: 8.7,
    replies: 87,
    creator: {
      username: "nenx_music",
      avatar: "/icon.png"
    },
    audio: "/music/Volon - Going Up (Original Mix).mp3"
  },
  "vin-diesel": {
    id: "vin-diesel",
    title: "Vin Diesel",
    artist: "GyiAMV",
    genre: "Trap",
    cover: "/placeholders/3.jpg",
    mcap: "$25.0K",
    totalVolume: "$2.5K",
    creatorEarnings: "$62",
    priceChange: 12.3,
    replies: 156,
    creator: {
      username: "gyiamv",
      avatar: "/icon.png"
    },
    audio: "/music/Volon - 2Pacman (Original Mix).mp3"
  },
  "midnight-vibes": {
    id: "midnight-vibes",
    title: "Midnight Vibes",
    artist: "SynthWave",
    genre: "Synthwave",
    cover: "/placeholders/4.jpg",
    mcap: "$15.2K",
    totalVolume: "$1.8K",
    creatorEarnings: "$38",
    priceChange: -2.4,
    replies: 67,
    creator: {
      username: "synthwave_official",
      avatar: "/icon.png"
    },
    audio: "/music/Voch - Illusion (Extended Mix).mp3"
  },
  "bass-drop": {
    id: "bass-drop",
    title: "Bass Drop",
    artist: "ElectroMix",
    genre: "EDM",
    cover: "/placeholders/5.jpg",
    mcap: "$32.1K",
    totalVolume: "$3.2K",
    creatorEarnings: "$81",
    priceChange: 15.6,
    replies: 203,
    creator: {
      username: "electromix_dj",
      avatar: "/icon.png"
    },
    audio: "/music/Vincent Jarroux - Phoenix.mp3"
  },
};

export function getTokenById(tokenId: string): TokenData | null {
  return tokenData[tokenId] || null;
} 