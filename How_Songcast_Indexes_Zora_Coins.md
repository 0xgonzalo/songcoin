# How Songcast Indexes Zora Coins

This project uses a **hybrid approach** that combines multiple methods to index and retrieve Zora coin data:

## 1. **Direct Blockchain Event Indexing** (Primary Method)
The main indexing mechanism is through direct blockchain event monitoring:

- **Event Listening**: The `useZoraEvents.ts` hook listens to `CoinCreated` events from the Zora Factory contract (`0x777777751622c0d3258f214F9DF38E35BF45baF3`)
- **Filtered by Platform Referrer**: They filter for coins created with their specific platform referrer addresses:
  - Regular coins: `0x32C8ACD3118766CBE5c3E45a44BCEDde953EF627`
  - Exclusive coins: `0x41f35485Dea9e5e7C683d1C6CA650e8179c606ba`
- **Batch Processing**: They process events in batches of ~950 blocks to avoid RPC limits
- **Caching**: Implements a 5-minute cache for event data to reduce API calls

## 2. **RPC Proxy Layer** 
They've built their own RPC proxy (`/api/rpc/route.ts`) to:
- Handle rate limiting (100,000 requests/minute)
- Implement fallback RPC endpoints
- Cache responses for 30 seconds
- Avoid CORS issues

## 3. **Zora Coins SDK Integration**
- Uses `@zoralabs/coins-sdk` for coin creation and trading
- Optionally uses Zora API key for enhanced functionality
- Handles metadata validation and IPFS gateway routing

## 4. **Direct Contract Reads**
For individual coin details, they:
- Read contract data directly using viem
- Fetch metadata from IPFS using multiple gateway fallbacks
- Parse standard ERC-721 functions (`name`, `symbol`, `tokenURI`, `payoutRecipient`)

## 5. **Known Coins Hardcoding**
They maintain a list of known coin addresses for immediate display:
```typescript
const KNOWN_COIN_ADDRESSES = [
  '0xc8054286955448bafd9d438b71ef55b90626ccf2',
  '0x50Ca3d669E893dA18Cc55875e8Ec7a12ce36cdcf',
  // ... more addresses
];
```

### What They're **NOT** Using:

❌ **External APIs**: No external coin indexing services  
❌ **Zora's GraphQL API**: No GraphQL queries found  
❌ **The Graph Protocol**: No subgraph usage  
❌ **Traditional Database**: No database for coin storage  

### Key Technical Details:

- **Chain**: Base mainnet only
- **Real-time**: Event-driven updates with refresh capabilities  
- **Metadata**: IPFS-based with multiple gateway fallbacks
- **Performance**: Implements caching at multiple levels (RPC, events, metadata)
- **Reliability**: Fallback mechanisms for RPC endpoints and IPFS gateways

This approach gives them full control over their data indexing while maintaining real-time updates and avoiding dependencies on external indexing services.

---

# Zora Events and Known Coins Explained

## What are Zora Events?

**Zora Events** are blockchain events emitted by Zora's smart contracts when specific actions occur. In this project, they're specifically listening to the `CoinCreated` event from Zora's factory contract.

### The CoinCreated Event Structure

When someone creates a new music coin through Zora, the factory contract emits this event with the following data:

```typescript
{
  caller: Address,           // Who created the coin
  payoutRecipient: Address,  // Who receives the payouts (usually the artist)
  platformReferrer: Address, // Which platform facilitated the creation
  currency: Address,         // What currency is used for trading
  uri: string,              // IPFS URI containing metadata
  name: string,             // Coin name (e.g., "MASKED BASSLINE")
  symbol: string,           // Coin symbol (e.g., "MASKBASS")
  coin: Address,            // The new coin's contract address
  pool: Address,            // Trading pool address
  version: string           // Contract version
}
```

### How Songcast Uses These Events

1. **Filtering**: They only listen for coins created with their platform referrer addresses:
   - Regular coins: `0x32C8ACD3118766CBE5c3E45a44BCEDde953EF627`
   - Exclusive coins: `0x41f35485Dea9e5e7C683d1C6CA650e8179c606ba`

2. **Scanning Strategy**: 
   - Scans blockchain from block `30146328` onwards
   - Processes in batches of 950 blocks to avoid RPC limits
   - Prioritizes "known blocks" where coins are expected to exist

3. **Data Enhancement**: For each event found, they:
   - Fetch the IPFS metadata using the `uri` field
   - Extract cover art, audio files, and descriptions
   - Transform raw event data into rich `MusicCoin` objects

## What are "Known Coins"?

**Known Coins** are a hardcoded list of specific coin contract addresses that Songcast displays immediately for better user experience, rather than waiting for event scanning to complete.

### The Known Coin Addresses

```typescript
const KNOWN_COIN_ADDRESSES = [
  '0xc8054286955448bafd9d438b71ef55b90626ccf2', // Example address
  '0x50Ca3d669E893dA18Cc55875e8Ec7a12ce36cdcf',
  '0x65b1409997826fbFff22a93e0959dC77fF0bCEa1',
  '0xafd68ffb2518117e026ad7c05c8327da2b3535e5',
  '0xA77890dcDA6De595BE130D770Ae9DB8Bb1bEA8Cc'
];
```

### Why Use Known Coins?

1. **Performance**: Instant display without waiting for blockchain event scanning
2. **User Experience**: Shows content immediately when users visit the site
3. **Featured Content**: Allows curating specific high-quality or popular tracks
4. **Fallback**: Ensures there's always content shown even if event scanning fails

### How Known Coins Work

1. **Direct Contract Calls**: For each known address, they directly call the coin contract to get:
   - `name()` - The coin's name
   - `symbol()` - The coin's trading symbol  
   - `tokenURI()` - IPFS link to metadata
   - `payoutRecipient()` - The artist's address

2. **Metadata Fetching**: They fetch the IPFS metadata to get:
   - Cover art images
   - Audio file URLs
   - Song descriptions
   - Artist information

3. **Display Strategy**: The app shows both:
   - **Known coins** (instant, curated content)
   - **Discovered coins** (from event scanning, all coins created via their platform)

## The Complete Flow

```
User visits /coins page
        ↓
1. Immediately fetch "Known Coins" → Show curated content
        ↓
2. Start background event scanning → Find all platform coins  
        ↓
3. Merge both datasets → Complete coin listing
```

This dual approach ensures users see content immediately while also discovering all coins created through their platform, providing both performance and completeness. 