import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Use the new configuration format for Next.js App Router
export const maxDuration = 60; // Extend the timeout to 60 seconds

export async function POST(request: NextRequest) {
  try {
    // Get the JSON data from the request
    const jsonData = await request.json();
    
    if (!jsonData) {
      return NextResponse.json(
        { error: 'No JSON data provided' },
        { status: 400 }
      );
    }
    
    // Get Pinata JWT from environment variables - try both private and public variables
    // Server should use PINATA_JWT but falls back to NEXT_PUBLIC_PINATA_JWT
    const JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
    
    // Debug info - mask JWT for security
    const jwtMasked = JWT ? `${JWT.substring(0, 20)}...${JWT.substring(JWT.length - 20)}` : 'undefined';
    
    console.log(`Server JWT for JSON: ${jwtMasked}`);
    
    if (!JWT) {
      return NextResponse.json(
        { 
          error: 'Pinata JWT not configured on the server. Please add PINATA_JWT or NEXT_PUBLIC_PINATA_JWT to your environment variables.',
          jwtPresent: !!JWT
        },
        { status: 500 }
      );
    }
    
    // Extract attributes data with proper typing for better metadata
    const attributes = Array.isArray(jsonData.attributes) ? jsonData.attributes : [];
    const findAttribute = (traitType: string) => {
      return attributes.find((attr: any) => attr && attr.trait_type === traitType)?.value || 'Unknown';
    };
    
    // Create the request body with metadata for better dashboard organization
    const requestBody = {
      pinataContent: jsonData,
      pinataMetadata: {
        name: jsonData.name ? `${jsonData.name}-metadata.json` : 'music-metadata.json',
        keyvalues: {
          type: 'metadata',
          contentType: 'application/json',
          musicName: jsonData.name || 'Unknown',
          artist: findAttribute('Artist'),
          genre: findAttribute('Genre'),
          uploadedAt: new Date().toISOString(),
          source: 'songcoin-app'
        }
      },
      pinataOptions: {
        cidVersion: 1,
        wrapWithDirectory: false
      }
    };
    
    // Send the request to Pinata using JWT authentication
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWT}`
        },
        maxBodyLength: Infinity,
      }
    );
    
    // Return the IPFS hash
    return NextResponse.json({
      IpfsHash: response.data.IpfsHash,
      uri: `ipfs://${response.data.IpfsHash}`
    });
    
  } catch (error: any) {
    console.error('Error uploading JSON to Pinata:', error);
    
    // If authentication error, provide more detailed message
    if (error.response?.status === 401) {
      return NextResponse.json(
        { 
          error: 'Authentication failed with Pinata. Please check your API keys in the server environment variables.',
          details: error.message,
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to upload metadata to IPFS',
        details: error.message,
        response: error.response?.data
      },
      { status: error.response?.status || 500 }
    );
  }
} 