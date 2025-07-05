import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Interface for metadata structure
interface MetadataItem {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

// Cache to store metadata by CID
const metadataCache = new Map<string, MetadataItem>();

/**
 * Extract CID from URL path or query parameter
 */
function extractCidFromRequest(request: NextRequest): string | null {
  // First check query parameter
  const cid = request.nextUrl.searchParams.get('cid');
  if (cid) return cid;
  
  // Then check path segments for Zora's pattern
  const pathParts = request.nextUrl.pathname.split('/');
  const ipfsIndex = pathParts.findIndex(part => part === 'ipfs');
  
  if (ipfsIndex >= 0 && ipfsIndex < pathParts.length - 1) {
    return pathParts[ipfsIndex + 1];
  }
  
  return null;
}

/**
 * API route to fetch and serve IPFS metadata
 * This works around Zora SDK's hardcoded IPFS gateway that's failing with 500 errors
 */
export async function GET(request: NextRequest) {
  try {
    // Get CID from the URL
    const cid = extractCidFromRequest(request);
    
    if (!cid) {
      return NextResponse.json({ error: 'Missing CID parameter' }, { status: 400 });
    }
    
    console.log('Proxy request received for CID:', cid);
    
    // Check if we have the metadata cached in memory
    if (metadataCache.has(cid)) {
      console.log('Serving metadata from cache for CID:', cid);
      return NextResponse.json(metadataCache.get(cid));
    }
    
    // List of IPFS gateways to try
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${cid}`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://ipfs.filebase.io/ipfs/${cid}`,
      `https://dweb.link/ipfs/${cid}`
    ];
    
    // Try each gateway until we successfully fetch metadata
    for (const gateway of gateways) {
      try {
        console.log(`Proxy trying gateway: ${gateway}`);
        const response = await axios.get(gateway, { timeout: 5000 });
        
        if (response.status === 200 && response.data) {
          // Cache the metadata
          metadataCache.set(cid, response.data);
          
          // Return the metadata with CORS headers
          return NextResponse.json(response.data, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET',
              'Access-Control-Allow-Headers': 'Content-Type',
            }
          });
        }
      } catch (error) {
        console.log(`Proxy gateway ${gateway} failed`);
        // Continue to the next gateway
      }
    }
    
    throw new Error('Failed to fetch metadata from any gateway');
  } catch {
    console.error('Error in metadata proxy');
    return NextResponse.json(
      { error: 'Failed to fetch metadata' }, 
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
} 