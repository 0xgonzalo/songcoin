import { PinataSDK } from "pinata";

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT as string;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY as string;

if (!PINATA_JWT) {
  throw new Error('Missing PINATA_JWT. Please check your .env file and make sure to prefix it with NEXT_PUBLIC_');
}

if (!PINATA_GATEWAY) {
  throw new Error('Missing PINATA_GATEWAY. Please check your .env file and make sure to prefix it with NEXT_PUBLIC_');
}

// Initialize Pinata SDK
export const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATA_GATEWAY,
});

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
 * Upload a file to IPFS via Pinata using the modern SDK
 */
export async function uploadFileToIPFS(file: File, onProgress?: (progress: number) => void): Promise<string> {
  try {
    console.log('📁 Uploading file to Pinata:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    // Add metadata for better organization
    const options = {
      metadata: {
        name: file.name,
        keyvalues: {
          type: file.type,
          size: file.size.toString(),
          uploadedAt: new Date().toISOString(),
        }
      }
    };

    const upload = await (pinata as any).upload.file(file, options);
    
    console.log('✅ File uploaded successfully:', upload);
    
    // Simulate progress for user feedback (since the SDK doesn't provide native progress tracking)
    if (onProgress) {
      onProgress(100);
    }
    
    return upload.cid;
  } catch (error) {
    console.error('❌ Upload error details:', error);
    throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload JSON metadata to IPFS via Pinata using the modern SDK
 */
export async function uploadJSONToIPFS(metadata: Record<string, unknown>): Promise<string> {
  try {
    console.log('📄 Uploading JSON metadata to Pinata:', metadata);
    
    const options = {
      metadata: {
        name: `${metadata.name || 'metadata'}.json`,
        keyvalues: {
          type: 'metadata',
          uploadedAt: new Date().toISOString(),
        }
      }
    };

    const upload = await (pinata as any).upload.json(metadata, options);
    
    console.log('✅ JSON metadata uploaded successfully:', upload);
    
    return upload.cid;
  } catch (error) {
    console.error('❌ Metadata upload error details:', error);
    throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a signed URL for private file access
 */
export async function createSignedUrl(cid: string, expires: number = 3600): Promise<string> {
  try {
    const url = await (pinata as any).gateways.createSignedURL({
      cid,
      expires,
    });
    return url;
  } catch (error) {
    console.error('❌ Signed URL creation error:', error);
    throw new Error(`Failed to create signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 