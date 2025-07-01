import axios, { AxiosError } from 'axios';

// Get environment variables - will need to be set by the user
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

export function getIpfsUrl(ipfsUrl: string): string {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }
  
  const ipfsHash = ipfsUrl.replace('ipfs://', '');
  return `${PINATA_GATEWAY}${ipfsHash}`;
}

/**
 * Upload a file to IPFS via Pinata
 */
export async function uploadFileToIPFS(file: File, onProgress?: (progress: number) => void): Promise<string> {
  try {
    // Detect if we're in a browser environment (client-side)
    if (typeof window !== 'undefined') {
      // Client-side: Use API route
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/pinata/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data.IpfsHash || response.data.cid;
    } else {
      // Server-side: Direct API call (fallback)
      if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        throw new Error('Pinata API keys not configured');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data.IpfsHash;
    }
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new Error('Invalid Pinata API credentials');
      } else if (error.response?.status === 413) {
        throw new Error('File too large for upload');
      } else if (error.response?.data?.error) {
        throw new Error(`Upload failed: ${error.response.data.error}`);
      }
    }
    
    throw new Error('Failed to upload file to IPFS');
  }
}

/**
 * Upload JSON metadata to IPFS via Pinata
 */
export async function uploadJSONToIPFS(metadata: Record<string, unknown>): Promise<string> {
  try {
    // Detect if we're in a browser environment (client-side)
    if (typeof window !== 'undefined') {
      // Client-side: Use API route
      const response = await axios.post('/api/pinata/json', {
        metadata
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data.IpfsHash || response.data.cid;
    } else {
      // Server-side: Direct API call (fallback)
      if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        throw new Error('Pinata API keys not configured');
      }

      const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
      });

      return response.data.IpfsHash;
    }
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new Error('Invalid Pinata API credentials');
      } else if (error.response?.data?.error) {
        throw new Error(`Upload failed: ${error.response.data.error}`);
      }
    }
    
    throw new Error('Failed to upload JSON to IPFS');
  }
} 