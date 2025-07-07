# SongCoin Setup Guide

This guide will help you set up the SongCoin project with all necessary API keys and environment variables.

## Prerequisites

- Node.js 18+ and npm/yarn
- A crypto wallet (MetaMask recommended)
- Base mainnet ETH for gas fees

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required: Pinata Configuration

Pinata is used for IPFS storage of audio files, cover art, and metadata.

1. Go to [Pinata](https://app.pinata.cloud/developers/api-keys)
2. Create an account and generate API keys
3. Add to your `.env.local`:

```env
PINATA_JWT=your_pinata_jwt_token_here
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here
```

### Required: Neynar Configuration

Neynar provides Farcaster API access for social features.

1. Go to [Neynar](https://dev.neynar.com/)
2. Create an account and get your API key
3. Add to your `.env.local`:

```env
NEYNAR_API_KEY=your_neynar_api_key_here
```

### Required: Base RPC Configuration

For blockchain interactions on Base mainnet.

```env
BASE_RPC_URL=https://mainnet.base.org
```

Alternative RPC providers (choose one):
- **Alchemy**: `https://base-mainnet.g.alchemy.com/v2/your_api_key`
- **Infura**: `https://base-mainnet.infura.io/v3/your_project_id`
- **QuickNode**: Your QuickNode Base endpoint

### Required: Application URLs

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FRAME_BASE_URL=http://localhost:3000
```

For production, replace with your actual domain.

### Optional: Wallet Connect

For enhanced wallet connection experience:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a project and get your Project ID
3. Add to your `.env.local`:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id_here
```

### Optional: Farcaster Integration

For advanced Farcaster features:

```env
FARCASTER_DEVELOPER_FID=your_farcaster_developer_fid_here
FARCASTER_DEVELOPER_MNEMONIC=your_farcaster_developer_mnemonic_here
```

## Installation Steps

1. **Clone and install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Create your `.env.local` file:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Smart Contract Addresses

The project uses these smart contracts on Base mainnet:

- **Zora Factory**: `0x777777751622c0d3258f214F9DF38E35BF45baF3`
- **Platform Referrer**: `0x79166ff20D3C3276b42eCE079a50C30b603167a6`

These are already configured in the codebase.

## Getting Test ETH

For testing on Base mainnet, you'll need ETH:

1. **Bridge ETH to Base:**
   - Use [Base Bridge](https://bridge.base.org/)
   - Bridge ETH from Ethereum mainnet to Base

2. **Buy ETH on Base:**
   - Use [Coinbase](https://www.coinbase.com/) (Base's parent company)
   - Use any exchange that supports Base withdrawals

## Feature Overview

After setup, you'll have access to:

### ✅ Implemented Features

- **Coin Creation**: Upload music and create ERC-20 tokens
- **IPFS Storage**: Audio files and metadata stored on IPFS via Pinata
- **Blockchain Integration**: Full Zora protocol integration on Base
- **Audio Player**: Built-in audio player with track management
- **Coin Discovery**: Browse and filter created music coins
- **Profile Management**: View user-created coins and portfolio
- **Farcaster Frames**: Social sharing integration
- **Responsive UI**: Mobile-first design with Tailwind CSS

### 🚧 Future Enhancements

- **Trading**: Buy/sell functionality for music coins
- **Price Discovery**: Real-time pricing and market data
- **Advanced Analytics**: Trading volume and market cap tracking
- **Social Features**: Comments, likes, and artist following
- **Playlist Creation**: Custom playlists with owned coins

## Troubleshooting

### Common Issues

1. **Pinata Upload Failures:**
   - Check your API keys are correct
   - Ensure you have sufficient Pinata storage quota
   - Verify file sizes are within limits (50MB audio, 10MB images)

2. **Blockchain Connection Issues:**
   - Ensure your wallet is connected to Base mainnet
   - Check you have sufficient ETH for gas fees
   - Verify RPC URL is accessible

3. **Metadata Loading Problems:**
   - IPFS can be slow - wait a few minutes after upload
   - Try refreshing the page or clearing cache
   - Check browser console for specific error messages

### Getting Help

- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Review the browser console for error messages
- Ensure all environment variables are properly set

## Security Notes

- **Never commit `.env.local`** to version control
- **Keep API keys secure** and rotate them regularly
- **Use testnet first** before deploying to mainnet with real funds
- **Backup your wallet** mnemonic phrase securely

## Production Deployment

For production deployment on Vercel:

1. Add all environment variables in Vercel dashboard
2. Update `NEXT_PUBLIC_APP_URL` to your production domain
3. Configure custom domain and SSL
4. Enable Vercel Analytics (optional)
5. Set up monitoring and error tracking

## Next Steps

1. Create your first music coin
2. Test the audio player functionality
3. Share your coins via Farcaster frames
4. Explore the profile and discovery features
5. Join the community and provide feedback! 