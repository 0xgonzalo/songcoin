import axios from 'axios';

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT as string;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY as string;

if (!PINATA_JWT) {
  throw new Error('Missing PINATA_JWT. Please check your .env file and make sure to prefix it with NEXT_PUBLIC_');
}

if (!PINATA_GATEWAY) {
  throw new Error('Missing PINATA_GATEWAY. Please check your .env file and make sure to prefix it with NEXT_PUBLIC_');
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
    return `https://${PINATA_GATEWAY}/ipfs/${hash}`;
  }
  
  if (ipfsHashOrUri.startsWith('http')) {
    return ipfsHashOrUri;
  }
  
  // Assume it's just a hash
  return `https://${PINATA_GATEWAY}/ipfs/${ipfsHashOrUri}`;
}

/**
 * Upload a file to IPFS via Pinata using JWT authentication
 */
export async function uploadFileToIPFS(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add metadata for better organization in dashboard
  formData.append('pinataMetadata', JSON.stringify({
    name: file.name,
    keyvalues: {
      type: file.type,
      size: file.size.toString(),
      uploadedAt: new Date().toISOString(),
    }
  }));

  try {
    console.log('📁 Uploading file to Pinata:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    const response = await axios.post<PinataResponse>(
      `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
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

    console.log('✅ File uploaded successfully:', response.data);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('❌ Upload error details:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to upload to IPFS: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Upload JSON metadata to IPFS via Pinata using JWT authentication
 */
export async function uploadJSONToIPFS(metadata: Record<string, unknown>): Promise<string> {
  try {
    console.log('📄 Uploading JSON metadata to Pinata:', metadata);
    
    const response = await axios.post<PinataResponse>(
      `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`,
        }
      }
    );

    console.log('✅ JSON metadata uploaded successfully:', response.data);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('❌ Metadata upload error details:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to upload metadata to IPFS: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

/**
 * Create a signed URL for private file access (fallback to public gateway)
 */
export async function createSignedUrl(cid: string, expires: number = 3600): Promise<string> {
  try {
    // For now, return public gateway URL since signed URL requires more complex setup
    return `https://${PINATA_GATEWAY}/ipfs/${cid}`;
  } catch (error) {
    console.error('❌ Signed URL creation error:', error);
    throw new Error(`Failed to create signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 