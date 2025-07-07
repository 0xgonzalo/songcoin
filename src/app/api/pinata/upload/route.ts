import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Use the new configuration format for Next.js App Router
export const maxDuration = 60; // Extend the timeout to 60 seconds

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Get Pinata JWT from environment variables - try both private and public variables
    // Server should use PINATA_JWT but falls back to NEXT_PUBLIC_PINATA_JWT
    const JWT = process.env.PINATA_JWT || process.env.NEXT_PUBLIC_PINATA_JWT;
    
    // Debug info - mask JWT for security
    const jwtMasked = JWT ? `${JWT.substring(0, 20)}...${JWT.substring(JWT.length - 20)}` : 'undefined';
    
    console.log(`Server JWT: ${jwtMasked}`);
    
    if (!JWT) {
      return NextResponse.json(
        { 
          error: 'Pinata JWT not configured on the server. Please add PINATA_JWT or NEXT_PUBLIC_PINATA_JWT to your environment variables.',
          jwtPresent: !!JWT
        },
        { status: 500 }
      );
    }
    
    // Create a new form data for Pinata with metadata for better dashboard organization
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    
    // Add metadata for better organization in dashboard
    const metadata = {
      name: file.name,
      keyvalues: {
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size.toString(),
        fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
        uploadedAt: new Date().toISOString(),
        category: file.type.startsWith('image/') ? 'coverArt' : 'audioFile',
        source: 'songcoin-app'
      }
    };
    
    pinataFormData.append('pinataMetadata', JSON.stringify(metadata));
    
    // Add pinataOptions for better organization
    pinataFormData.append('pinataOptions', JSON.stringify({
      cidVersion: 1,
      wrapWithDirectory: false
    }));
    
    // Send the request to Pinata using JWT authentication
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      pinataFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${JWT}`
        },
        maxBodyLength: Infinity, // Allow unlimited body size
        maxContentLength: Infinity, // Allow unlimited content length
        timeout: 60000, // 60 second timeout
      }
    );
    
    // Return the IPFS hash
    return NextResponse.json({
      IpfsHash: response.data.IpfsHash
    });
    
  } catch (error: unknown) {
    console.error('Error uploading to Pinata:', error);
    
    // Determine if this is a size limitation error
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'status' in error.response && 
        error.response.status === 413) {
      return NextResponse.json(
        { 
          error: 'File too large for upload. Please use a smaller file (Audio: max 4MB, Images: max 2MB).',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 413 }
      );
    }
    
    // If authentication error, provide more detailed message
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'status' in error.response && 
        error.response.status === 401) {
      return NextResponse.json(
        { 
          error: 'Authentication failed with Pinata. Please check your API keys in the server environment variables.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to upload to IPFS',
        details: error instanceof Error ? error.message : 'Unknown error',
        response: error && typeof error === 'object' && 'response' in error ? 
          (error.response && typeof error.response === 'object' && 'data' in error.response ? error.response.data : null) : null
      },
      { status: error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'status' in error.response && 
        typeof error.response.status === 'number' ? error.response.status : 500 }
    );
  }
} 