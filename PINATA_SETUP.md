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
# Pinata API Keys for IPFS uploads
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key_here
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Optional: Server-side keys (recommended for production)
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here
```

**Important:** Keep these keys secure and never commit them to version control.

## 4. File Size Limits

The current configuration supports (direct upload to Pinata):
- **Images**: Up to 5MB (PNG, JPG, etc.)
- **Audio**: Up to 50MB (MP3, WAV, OGG, FLAC, M4A, AAC) - Direct upload bypasses Vercel limits

## 5. Testing

To test your Pinata integration:
1. Start your development server: `npm run dev`
2. Go to `/create` page
3. Try uploading a small image and audio file
4. Check the browser console for upload progress

## Troubleshooting

**Authentication Error**: Double-check your API keys are correct and have the right permissions.

**Upload Timeout**: Large files may take time to upload. Direct uploads to Pinata have no artificial timeout limits.

**File Too Large**: Files up to 50MB are supported. If you need larger files:
- Compress your audio files
- Use Pinata's chunked upload for very large files
- Consider splitting longer audio files

## Features

The integration provides:
- ✅ Direct client-side uploads to Pinata (bypasses Vercel limitations)
- ✅ Support for larger file sizes (up to 50MB)
- ✅ Parallel file uploads for faster processing
- ✅ Error handling with user-friendly messages
- ✅ No dependency on Vercel API routes
- ✅ Support for multiple IPFS gateways
- ✅ Automatic metadata generation for Zora coins
- ✅ Retry logic for failed uploads 