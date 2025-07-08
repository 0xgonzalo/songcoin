import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    accountAssociation: {
      "header": "eyJmaWQiOjM1NTU4OCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweEI2QTUwRGI1MkY3MDNkYkIwMDlGMDNGNkViN2Y1NThmMTEwQzliMEQifQ",
      "payload": "eyJkb21haW4iOiJzb25nY29pbi52ZXJjZWwuYXBwIn0",
      "signature": "N6bJKK/q3vTMo5Sm2lYEcT3O3A3sz/gdXpqoa2C/UC0ZLgbXmDj8e7GQLrmgIk+2RQ1H+gg7JOQi176dgn7fhRs="
    },
    frame: {
      version: 'next',
      name: 'Songcoin',
      iconUrl: 'https://songcoin.vercel.app/icon.png',
      buttonTitle: 'Launch Songcoin',
      splashImageUrl: 'https://songcoin.vercel.app/splash.png',
      splashBackgroundColor: '#f7f7f7',
      homeUrl: 'https://songcoin.vercel.app',
      imageUrl: 'https://songcoin.vercel.app/splash.png',
      webhookUrl: 'https://api.neynar.com/f/app/af8c8a0d-42e9-46b8-b866-737e9d8089f0/event',
    },
    miniApp: {
      name: 'Songcoin',
      description: 'Listen, explore and trade music records on the blockchain',
      iconUrl: 'https://songcoin.vercel.app/icon.png',
      primaryCategory: 'music',
      tags: ['music', 'crypto', 'trading', 'nft', 'zora', 'songcoin'],
      url: 'https://songcoin.vercel.app',
      buttonTitle: 'Launch Songcoin',
      splashImageUrl: 'https://songcoin.vercel.app/splash.png',
      splashBackgroundColor: '#f7f7f7',
      webhookUrl: 'https://api.neynar.com/f/app/af8c8a0d-42e9-46b8-b866-737e9d8089f0/event',
      subtitle: 'Transform your music into tradeable tokens',
      screenshotUrls: ['https://songcoin.vercel.app/splash.png'],
      heroImageUrl: 'https://songcoin.vercel.app/splash.png',
      tagline: 'Transform your music into tradeable tokens',
      ogTitle: 'Songcoin - Trade, Explore and Collect Music',
      ogDescription: 'Listen, explore and trade music records on the blockchain',
      ogImageUrl: 'https://songcoin.vercel.app/splash.png',
      castShareUrl: 'https://songcoin.vercel.app'
    }
  };

  return NextResponse.json(manifest);
}
