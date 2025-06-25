import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');

    if (!cid) {
      return NextResponse.json(
        { error: 'CID parameter is required' },
        { status: 400 }
      );
    }

    // List of IPFS gateways to try
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${cid}`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://ipfs.filebase.io/ipfs/${cid}`,
      `https://dweb.link/ipfs/${cid}`
    ];

    // Try each gateway
    for (const gateway of gateways) {
      try {
        console.log(`Trying to fetch metadata from: ${gateway}`);
        const response = await axios.get(gateway, { 
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
          }
        });

        if (response.status === 200 && response.data) {
          console.log('Successfully fetched metadata via proxy');
          return NextResponse.json(response.data);
        }
      } catch (error) {
        console.log(`Gateway ${gateway} failed:`, error);
        continue;
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch metadata from any IPFS gateway' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error in metadata proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 