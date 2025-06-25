# Pinata Setup Guide

This application uses Pinata for IPFS uploads when creating music coins. Follow these steps to set up your Pinata account and API keys.

## 1. Create a Pinata Account

1. Go to [Pinata.cloud](https://pinata.cloud)
2. Sign up for a free account
3. Verify your email address

## 2. Generate API Keys

1. Log into your Pinata dashboard
2. Go to "API Keys" in the sidebar
3. Click "New Key"
4. Select the following permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
5. Give your key a name (e.g., "SongCoin App")
6. Click "Create Key"
7. Copy both the **API Key** and **API Secret** (you won't be able to see the secret again)

## 3. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Pinata API Keys for server-side uploads (required)
PINATA_API_KEY=9ba1d566fe4cac5ab90e
PINATA_SECRET_KEY=your_pinata_secret_key_here

# Optional: Client-side keys for direct uploads (fallback only)
# Only add these if you need direct browser-to-Pinata uploads
# NEXT_PUBLIC_PINATA_API_KEY=9ba1d566fe4cac5ab90e
# NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key_here
```

## Upload Strategy

The app uses a **hybrid upload approach**:

1. **Primary Method**: Server-side API route (`/api/pinata/upload`)
   - Uses `PINATA_API_KEY` and `PINATA_SECRET_KEY`
   - Keeps API keys secure on the server
   - Works for most file sizes

2. **Fallback Method**: Direct browser-to-Pinata upload
   - Only used if API route fails (413 errors, server issues)
   - Requires `NEXT_PUBLIC_PINATA_API_KEY` and `NEXT_PUBLIC_PINATA_SECRET_KEY`
   - **Warning**: These keys are exposed to the browser

## Recommended Setup

**For most users**: Only set the server-side keys:
```bash
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_KEY=your_secret_key_here
```

**For advanced users with large files**: Add both server-side and client-side keys for maximum reliability.

## 4. File Size Limits

The current configuration supports:
- **Images**: Up to 10MB (PNG, JPG, etc.)
- **Audio**: Up to 100MB (MP3, WAV)

## 5. Testing

To test your Pinata integration:
1. Start your development server: `npm run dev`
2. Go to `/create` page
3. Try uploading a small image and audio file
4. Check the browser console for upload progress

## Troubleshooting

**"Pinata API keys are not configured"**: Make sure you have `PINATA_API_KEY` and `PINATA_SECRET_KEY` in your `.env.local` file.

**Authentication Error**: Double-check your API keys are correct and have the right permissions.

**Upload Timeout**: Large files may take time to upload. The timeout is set to 2 minutes.

**File Too Large**: The server API route has size limits. Large files will automatically try direct upload if client-side keys are available.

## Features

The integration provides:
- ✅ File upload progress tracking
- ✅ Error handling with user-friendly messages
- ✅ Hybrid upload strategy (server-first, client fallback)
- ✅ Support for multiple IPFS gateways
- ✅ Automatic metadata generation for Zora coins
- ✅ Secure API key handling 