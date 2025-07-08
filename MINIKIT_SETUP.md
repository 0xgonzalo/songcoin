# Songcoin MiniKit Integration Setup

This guide covers the integration of MiniKit to make Songcoin production-ready for Farcaster.

## Overview

Songcoin has been integrated with Coinbase's MiniKit to enable seamless deployment as a Farcaster mini-app. This integration allows users to interact with the app directly within the Farcaster ecosystem.

## Required Environment Variables

Set these in your Vercel dashboard or `.env.local` file:

### App Configuration
```
NEXT_PUBLIC_URL=https://your-app-domain.com
NEXT_PUBLIC_MINI_APP_NAME=Songcoin
NEXT_PUBLIC_MINI_APP_DESCRIPTION=Listen, explore and trade music records on the blockchain
NEXT_PUBLIC_MINI_APP_PRIMARY_CATEGORY=music
NEXT_PUBLIC_MINI_APP_TAGS=music,crypto,trading,nft
NEXT_PUBLIC_MINI_APP_BUTTON_TEXT=Launch Songcoin
```

### OnchainKit & Coinbase Developer Platform
```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here
NEXT_PUBLIC_CDP_PROJECT_ID=your_cdp_project_id_here
```

### Neynar (Farcaster)
```
NEYNAR_API_KEY=your_neynar_api_key_here
NEYNAR_CLIENT_ID=your_neynar_client_id_here
```

### Other Required Variables
```
NEXT_PUBLIC_USE_WALLET=true
SOLANA_RPC_ENDPOINT=https://solana-rpc.publicnode.com
NEXTAUTH_URL=https://your-app-domain.com
NEXTAUTH_SECRET=your_nextauth_secret_here
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here
```

## Setup Steps

### 1. Get OnchainKit API Key
1. Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new project
3. Get your API key and Project ID
4. Set `NEXT_PUBLIC_ONCHAINKIT_API_KEY` and `NEXT_PUBLIC_CDP_PROJECT_ID`

### 2. Configure Neynar
1. Visit [Neynar](https://neynar.com/)
2. Create an account and get your API key
3. Create a client ID for your app
4. Set `NEYNAR_API_KEY` and `NEYNAR_CLIENT_ID`

### 3. Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy the application
4. Note your deployment URL

### 4. Register with Farcaster
1. Your app will be available at `https://your-domain.com/.well-known/farcaster.json`
2. This endpoint provides the Farcaster manifest for your mini-app
3. Submit your app to Farcaster for review

## Key Features Integrated

### MiniKit Provider
- Wraps the app with OnchainKit provider
- Enables Base network connectivity
- Provides wallet integration

### Farcaster Manifest
- Located at `/.well-known/farcaster.json`
- Contains app metadata for Farcaster discovery
- Includes frame and mini-app configurations

### Enhanced Metadata
- Open Graph tags for social sharing
- Farcaster-specific frame metadata
- Twitter Card support

### Production Optimizations
- Proper caching headers
- Frame security configurations
- API route optimizations

## Testing

### Local Development
```bash
npm run dev
```
Visit `http://localhost:3000/.well-known/farcaster.json` to verify the manifest.

### Production Testing
1. Deploy to Vercel
2. Test the manifest endpoint
3. Verify frame functionality in Farcaster clients

## Deployment Checklist

- [ ] All environment variables set
- [ ] OnchainKit API key configured
- [ ] Neynar integration working
- [ ] Manifest endpoint responding correctly
- [ ] App deployed to production domain
- [ ] Frame metadata properly configured
- [ ] Wallet connectivity tested

## Resources

- [MiniKit Documentation](https://docs-minikit.vercel.app/)
- [OnchainKit Documentation](https://onchainkit.xyz/)
- [Farcaster Developer Docs](https://docs.farcaster.xyz/)
- [Neynar API Documentation](https://docs.neynar.com/)

## Support

For issues specific to MiniKit integration, refer to the official documentation or submit an issue to the Songcoin repository. 