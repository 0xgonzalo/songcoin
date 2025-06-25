import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Configure route for file uploads
export const maxDuration = 60; // 60 seconds for Vercel hobby plan

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
    
    // Get Pinata API keys from environment variables
    const API_KEY = process.env.PINATA_API_KEY || process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const SECRET_KEY = process.env.PINATA_SECRET_KEY || process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
    
    if (!API_KEY || !SECRET_KEY) {
      return NextResponse.json(
        { 
          error: 'Pinata API keys not configured on the server',
          apiKeyPresent: !!API_KEY,
          secretKeyPresent: !!SECRET_KEY
        },
        { status: 500 }
      );
    }
    
    // Create form data for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    
    // Send to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      pinataFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': API_KEY,
          'pinata_secret_api_key': SECRET_KEY
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 50000, // 50 second timeout to stay within Vercel limits
      }
    );
    
    // Return the IPFS hash
    return NextResponse.json({
      IpfsHash: response.data.IpfsHash
    });
    
  } catch (error: unknown) {
    console.error('Error uploading to Pinata:', error);
    
    if (axios.isAxiosError(error)) {
      // Handle specific HTTP errors
      if (error.response?.status === 413) {
        return NextResponse.json(
          { 
            error: 'File too large for server upload. Try using a smaller file or direct upload.',
            details: error.message,
          },
          { status: 413 }
        );
      }
      
      if (error.response?.status === 401) {
        return NextResponse.json(
          { 
            error: 'Authentication failed with Pinata. Please check your API keys.',
            details: error.message,
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to upload to IPFS',
          details: error.message,
          response: error.response?.data
        },
        { status: error.response?.status || 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to upload to IPFS',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 