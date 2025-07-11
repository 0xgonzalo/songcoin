# Songcoin: Create, Explore and trade Music Coins 🪐


### Introduction
Songcoin is a Farcaster Mini App that lets musicians upload songs or albums and mint tokenized music releases using Zora’s Coins Protocol. Each new release (single or album) gets its own ERC-20 “song coin” with on-chain metadata pointing to the music file. Songcoin is designed as a social platform: by running natively in Farcaster, it leverages the Farcaster social graph and wallet integration for seamless user engagement. Users sign in with their Farcaster identity, share new songs to their feeds, and trade music tokens on-chain. This paper details Songcoin’s architecture, features, and MVP implementation, highlighting its integrations with Farcaster, Zora, IPFS (via Pinata), and Uniswap.

### System Architecture

### Farcaster Mini App Integration
Songcoin is implemented as a Farcaster Mini App taking advantage of the social graph that inherits the user’s Farcaster Identity (FID), username, followers/following, and profile picture. 

The Farcaster client already connects the user to their preferred wallet, so Songcoin’s code can simply call wallet actions. In effect, Songcoin’s smart-contract interactions (coin creation, buying/selling tokens) flow through the Warpcast wallet seamlessly.
Zora Coins SDK and Token Minting
Songcoin uses Zora’s Coins Protocol to mint music coins. 

#### Decentralized Storage (Pinata / IPFS)
All audio files, album art, and metadata are stored on IPFS. When a user uploads a song or cover image, Songcoin’s front-end sends the file to Pinata’s API. Pinata’s service is specifically designed for this purpose: it provides IPFS APIs to upload and pin files in either public or private IPFS networks. For example, using Pinata’s SDK or HTTP API, Songcoin can upload an MP3 or FLAC file and receive back a content identifier (CID). That CID is then included in the Zora coin’s metadata URI (e.g. ipfs://<CID>). By storing assets on IPFS via Pinata, Songcoin ensures the music and art remain decentralized and immutable, while the token contract simply holds a reference.

Read also .md files for more instruction on how to fork the repository

Made during Zora's Coinathon
