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
PINATA_API_KEY=9ba1d566fe4cac5ab90e
PINATA_SECRET_KEY=your_pinata_secret_key_here
```

**Important:** Keep these keys secure and never commit them to version control.

## 4. File Size Limits

The current configuration supports:
- **Images**: Up to 5MB (PNG, JPG, etc.)
- **Audio**: Up to 50MB (MP3, WAV)

## 5. Testing

To test your Pinata integration:
1. Start your development server: `npm run dev`
2. Go to `/create` page
3. Try uploading a small image and audio file
4. Check the browser console for upload progress

## Troubleshooting

**Authentication Error**: Double-check your API keys are correct and have the right permissions.

**Upload Timeout**: Large files may take time to upload. The timeout is set to 60 seconds.

**File Too Large**: Reduce your file sizes or increase the limits in the API routes if needed.

## Features

The integration provides:
- ✅ File upload progress tracking
- ✅ Error handling with user-friendly messages
- ✅ Support for multiple IPFS gateways
- ✅ Automatic metadata generation for Zora coins
- ✅ Retry logic for failed uploads 