import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

// Use the new configuration format for Next.js App Router
export const maxDuration = 60; // Maximum allowed for Vercel hobby plan

// Configure route segment for larger file uploads
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

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

    // Check file size on the server side (100MB limit)
    const maxFileSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { 
          error: `File too large. Maximum size is 100MB, but received ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
          fileSize: file.size,
          maxSize: maxFileSize
        },
        { status: 413 }
      );
    }
    
    // Get Pinata API keys from environment variables - try both private and public variables
    // Server should use PINATA_API_KEY but falls back to NEXT_PUBLIC_PINATA_API_KEY
    const API_KEY = process.env.PINATA_API_KEY || process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const SECRET_KEY = process.env.PINATA_SECRET_KEY || process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
    
    // Debug info - mask keys for security
    const apiKeyMasked = API_KEY ? `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}` : 'undefined';
    const secretKeyMasked = SECRET_KEY ? `${SECRET_KEY.substring(0, 4)}...${SECRET_KEY.substring(SECRET_KEY.length - 4)}` : 'undefined';
    
    console.log(`Server API Key: ${apiKeyMasked}`);
    console.log(`Server Secret Key: ${secretKeyMasked}`);
    console.log(`File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
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
    
    // Create a new form data for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    
    // Send the request to Pinata with extended timeouts and size limits
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      pinataFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': API_KEY,
          'pinata_secret_api_key': SECRET_KEY
        },
        maxBodyLength: Infinity, // Allow unlimited body size
        maxContentLength: Infinity, // Allow unlimited content length
        timeout: 50000, // 50 second timeout to stay within Vercel limits
      }
    );
    
    // Return the IPFS hash
    return NextResponse.json({
      IpfsHash: response.data.IpfsHash
    });
    
  } catch (error: unknown) {
    console.error('Error uploading to Pinata:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle Axios errors specifically
    if (error instanceof AxiosError) {
      const status = error.response?.status || 500;
      
      // Determine if this is a size limitation error
      if (status === 413) {
        return NextResponse.json(
          { 
            error: 'File too large for upload. Please use a smaller file (recommended: under 50MB for audio files).',
            details: errorMessage,
          },
          { status: 413 }
        );
      }
      
      // If authentication error, provide more detailed message
      if (status === 401) {
        return NextResponse.json(
          { 
            error: 'Authentication failed with Pinata. Please check your API keys in the server environment variables.',
            details: errorMessage,
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to upload to IPFS',
          details: errorMessage,
          response: error.response?.data || null
        },
        { status }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Failed to upload to IPFS',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
} 