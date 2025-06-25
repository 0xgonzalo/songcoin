import axios, { AxiosError } from 'axios';

// Get environment variables - NEXT_PUBLIC_ for client-side access
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

/**
 * Upload a file to IPFS via Pinata - Direct API approach
 */
export async function uploadFileToIPFS(file: File, onProgress?: (progress: number) => void): Promise<string> {
  try {
    console.log(`Uploading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    // Verify API keys are available
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata API keys are not configured. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY in your environment variables.');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload directly to Pinata API
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          if (onProgress) onProgress(percentCompleted);
        }
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000 // 2 minute timeout for large files
    });
    
    console.log('File uploaded successfully:', response.data.IpfsHash);
    return `ipfs://${response.data.IpfsHash}`;
    
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new Error('Pinata authentication failed. Please check your API keys.');
      } else if (error.response?.status === 413) {
        throw new Error('File too large for upload. Please use a smaller file.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please try again with a smaller file.');
      }
    }
    
    throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload JSON metadata to IPFS - Direct API approach
 */
export async function uploadJSONToIPFS(metadata: Record<string, unknown>): Promise<string> {
  try {
    console.log('Uploading metadata to IPFS...');
    
    // Verify API keys are available
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata API keys are not configured. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY in your environment variables.');
    }
    
    // Validate required fields
    if (!metadata.name || !metadata.image || !metadata.description) {
      throw new Error('Metadata must include name, image, and description fields');
    }
    
    // Clean and format metadata for Zora
    const cleanedMetadata = {
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      animation_url: metadata.animation_url,
      external_url: metadata.external_url || "",
      properties: metadata.properties || {},
      attributes: metadata.attributes || []
    };
    
    console.log('Uploading metadata:', JSON.stringify(cleanedMetadata, null, 2));
    
    // Upload directly to Pinata API
    const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', cleanedMetadata, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 60000 // 1 minute timeout
    });
    
    const ipfsHash = response.data.IpfsHash;
    console.log('Metadata uploaded successfully:', ipfsHash);
    
    return `ipfs://${ipfsHash}`;
    
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new Error('Pinata authentication failed. Please check your API keys.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Metadata upload timeout. Please try again.');
      }
    }
    
    throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get IPFS URL from CID or URI
 */
export function getIpfsUrl(uri: string): string {
  if (!uri) return '';
  
  console.log('Converting IPFS URI:', uri);
  
  // Define the gateway URL
  const GATEWAY_URL = PINATA_GATEWAY.endsWith('/') 
    ? PINATA_GATEWAY 
    : PINATA_GATEWAY + '/';
  
  let url = '';
  
  try {
    if (uri.startsWith('ipfs://')) {
      // Extract CID from ipfs:// URI
      const cid = uri.substring(7).trim();
      url = `${GATEWAY_URL}${cid}`;
    } else if (uri.startsWith('http')) {
      // Already an HTTP URL
      url = uri;
    } else {
      // Assume it's a raw CID
      url = `${GATEWAY_URL}${uri.trim()}`;
    }
    
    console.log('Converted to URL:', url);
    return url;
  } catch (error) {
    console.error('Error processing IPFS URL:', error);
    return uri;
  }
} 