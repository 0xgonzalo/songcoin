import axios from 'axios';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY as string;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY as string;

if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
  throw new Error('Missing Pinata API credentials. Please check your .env file. Make sure to prefix them with NEXT_PUBLIC_');
}

const PINATA_BASE_URL = 'https://api.pinata.cloud';

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export function getIpfsUrl(ipfsHashOrUri: string): string {
  if (ipfsHashOrUri.startsWith('ipfs://')) {
    const hash = ipfsHashOrUri.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  
  if (ipfsHashOrUri.startsWith('http')) {
    return ipfsHashOrUri;
  }
  
  // Assume it's just a hash
  return `https://gateway.pinata.cloud/ipfs/${ipfsHashOrUri}`;
}

/**
 * Upload a file to IPFS via Pinata using axios and FormData
 */
export async function uploadFileToIPFS(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  // Optional: Add metadata
  formData.append('pinataMetadata', JSON.stringify({
    name: file.name,
    keyvalues: {
      type: file.type,
      size: file.size.toString()
    }
  }));

  try {
    const response = await axios.post<PinataResponse>(
      `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        }
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Upload error details:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to upload to IPFS: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Upload JSON metadata to IPFS via Pinata using axios
 */
export async function uploadJSONToIPFS(metadata: Record<string, unknown>): Promise<string> {
  try {
    const response = await axios.post<PinataResponse>(
      `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        }
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Metadata upload error details:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to upload metadata to IPFS: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
} 