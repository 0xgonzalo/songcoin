import axios from 'axios';

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT as string;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY as string;

if (!PINATA_JWT) {
  throw new Error('Missing PINATA_JWT. Please check your .env file and make sure to prefix it with NEXT_PUBLIC_');
}

if (!PINATA_GATEWAY) {
  throw new Error('Missing PINATA_GATEWAY. Please check your .env file and make sure to prefix it with NEXT_PUBLIC_');
}

// Validate JWT token format
if (!PINATA_JWT.startsWith('eyJ')) {
  console.warn('⚠️  PINATA_JWT does not appear to be a valid JWT token. Make sure you are using a JWT token from Pinata, not an API key.');
}

const PINATA_BASE_URL = 'https://api.pinata.cloud';

interface AttributeItem {
  trait_type: string;
  value: string;
}

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
  
  // Add comprehensive metadata for better organization in dashboard
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
  
  formData.append('pinataMetadata', JSON.stringify(metadata));
  
  // Add pinataOptions for better organization
  formData.append('pinataOptions', JSON.stringify({
    cidVersion: 1,
    wrapWithDirectory: false
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
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      console.error('❌ Full error response:', error.response?.data);
      throw new Error(`Failed to upload to IPFS: ${errorMsg}`);
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
    
    // Safely extract attributes data with proper typing
    const attributes = Array.isArray(metadata.attributes) ? metadata.attributes : [];
    const findAttribute = (traitType: string) => {
      return (attributes as AttributeItem[]).find(attr => attr && attr.trait_type === traitType)?.value || 'Unknown';
    };
    
    const requestBody = {
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.name || 'Music'}-metadata.json`,
        keyvalues: {
          type: 'metadata',
          contentType: 'application/json',
          musicName: metadata.name as string,
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
    
    const response = await axios.post<PinataResponse>(
      `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
      requestBody,
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
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      console.error('❌ Full error response:', error.response?.data);
      throw new Error(`Failed to upload metadata to IPFS: ${errorMsg}`);
    }
    throw error;
  }
}

/**
 * Create a signed URL for private file access (fallback to public gateway)
 */
export async function createSignedUrl(cid: string): Promise<string> {
  try {
    // For now, return public gateway URL since signed URL requires more complex setup
    return `https://${PINATA_GATEWAY}/ipfs/${cid}`;
  } catch (error) {
    console.error('❌ Signed URL creation error:', error);
    throw new Error(`Failed to create signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 