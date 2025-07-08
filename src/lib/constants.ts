// Ensure APP_URL has proper https:// prefix and fallback
const rawUrl = process.env.NEXT_PUBLIC_URL || 'https://songcoin.vercel.app';
export const APP_URL = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

export const APP_NAME = process.env.NEXT_PUBLIC_MINI_APP_NAME || 'Songcoin';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_MINI_APP_DESCRIPTION || 'Transform your music into tradeable tokens';
export const APP_PRIMARY_CATEGORY = process.env.NEXT_PUBLIC_MINI_APP_PRIMARY_CATEGORY || 'music';
export const APP_TAGS = process.env.NEXT_PUBLIC_MINI_APP_TAGS?.split(',') || ['music', 'crypto', 'trading', 'nft'];
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_OG_IMAGE_URL = `${APP_URL}/api/opengraph-image`;
export const APP_SPLASH_URL = `${APP_URL}/splash.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#f7f7f7";
export const APP_BUTTON_TEXT = process.env.NEXT_PUBLIC_MINI_APP_BUTTON_TEXT || 'Launch Songcoin';
export const APP_WEBHOOK_URL = process.env.NEYNAR_API_KEY && process.env.NEYNAR_CLIENT_ID 
    ? `https://api.neynar.com/f/app/${process.env.NEYNAR_CLIENT_ID}/event`
    : `${APP_URL}/api/webhook`;
export const USE_WALLET = process.env.NEXT_PUBLIC_USE_WALLET === 'true';
