import axios, { AxiosError } from 'axios';

// Get environment variables for direct API access (fallback only)
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';

export function getIpfsUrl(ipfsUrl: string): string {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }
  
  const ipfsHash = ipfsUrl.replace('ipfs://', '');
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}

/**
 * Upload a file to IPFS via Pinata using cast repository approach
 */
export async function uploadFileToIPFS(
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    console.log(`Starting upload for file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    // Get the file size in MB
    const fileSizeMB = file.size / (1024 * 1024);
    const isLargeFile = fileSizeMB > 10; // Files over 10MB use direct API
    
    // Check if we're running in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isBrowser = typeof window !== 'undefined';
    
    console.log(`Environment: ${isDevelopment ? 'development' : 'production'}, isBrowser: ${isBrowser}, isLargeFile: ${isLargeFile}`);
    
    // For large files, use direct API in both environments
    if (isLargeFile) {
      console.log('Large file detected, using direct Pinata API');
      return await uploadDirectToPinata(file, onProgress);
    }
    
    // Use direct API call in development, proxy API in production (exactly like cast repo)
    if (isBrowser && !isDevelopment) {
      // In production, use our API proxy to avoid CORS issues for smaller files
      console.log('Production mode: using API route');
      return await uploadViaAPIRoute(file, onProgress);
    } else {
      // In development, call Pinata API directly
      console.log('Development mode: using direct API');
      return await uploadDirectToPinata(file, onProgress);
    }
    
  } catch (error: unknown) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
}

/**
 * Upload via API route (for smaller files in production)
 */
async function uploadViaAPIRoute(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await axios.post('/api/pinata/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minute timeout
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
    });

    if (response.data.IpfsHash) {
      console.log(`Upload via API route successful: ${response.data.IpfsHash}`);
      return response.data.IpfsHash;
    } else {
      throw new Error('No IPFS hash returned from API route upload');
    }
  } catch (proxyError) {
    // If we get a 413 error and have API keys, fall back to direct API (like cast repo)
    if (proxyError instanceof AxiosError && proxyError.response?.status === 413 && PINATA_API_KEY && PINATA_SECRET_KEY) {
      console.log('API proxy returned 413, falling back to direct API');
      return await uploadDirectToPinata(file, onProgress);
    }
    
    // If it's not a 413 error or we don't have keys for direct upload, rethrow
    throw proxyError;
  }
}

/**
 * Upload directly to Pinata API (for larger files or development)
 */
async function uploadDirectToPinata(file: File, onProgress?: (progress: number) => void): Promise<string> {
  // Verify API keys are available for direct upload
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.error('Direct upload attempted but API keys not available:', { 
      hasApiKey: !!PINATA_API_KEY, 
      hasSecretKey: !!PINATA_SECRET_KEY 
    });
    throw new Error('Pinata API keys are not configured for direct upload. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        onProgress(progress);
      }
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 120000 // 2 minute timeout for direct uploads
  });

  if (response.data.IpfsHash) {
    console.log(`Direct upload successful: ${response.data.IpfsHash}`);
    return response.data.IpfsHash;
  } else {
    throw new Error('No IPFS hash returned from direct upload');
  }
}

/**
 * Upload JSON metadata to IPFS via Pinata
 */
export async function uploadJSONToIPFS(jsonData: Record<string, unknown>): Promise<string> {
  try {
    const response = await axios.post('/api/pinata/json', jsonData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout for JSON uploads
    });

    if (response.data.uri) {
      return response.data.uri; // Returns ipfs://hash format
    } else if (response.data.IpfsHash) {
      return `ipfs://${response.data.IpfsHash}`;
    } else {
      throw new Error('No IPFS hash returned from JSON upload');
    }
  } catch (error: unknown) {
    console.error('Error uploading JSON to IPFS:', error);
    
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your Pinata API configuration.');
      } else {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(`JSON upload failed: ${errorMessage}`);
      }
    } else if (error instanceof Error) {
      throw new Error(`JSON upload failed: ${error.message}`);
    } else {
      throw new Error('JSON upload failed: Unknown error');
    }
  }
} 