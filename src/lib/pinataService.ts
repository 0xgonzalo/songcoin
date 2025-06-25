import axios from 'axios';

// Get environment variables - cast app uses both client and server keys
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
 * Upload a file to IPFS via Pinata - simplified cast approach
 */
export async function uploadFileToIPFS(
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    console.log(`Uploading file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    // Check if we have API keys
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata API keys not configured. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY environment variables.');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload directly to Pinata (like cast app does)
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
      timeout: 120000 // 2 minute timeout
    });

    if (response.data.IpfsHash) {
      const cid = response.data.IpfsHash;
      console.log(`Upload successful: ${cid}`);
      console.log(`File accessible at: https://gateway.pinata.cloud/ipfs/${cid}`);
      return cid;
    } else {
      throw new Error('No IPFS hash returned from upload');
    }
  } catch (error: unknown) {
    console.error('Error uploading file to IPFS:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 413) {
        throw new Error('File too large for upload. Please use a smaller file.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your Pinata API keys.');
      } else {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(`Upload failed: ${errorMessage}`);
      }
    } else if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    } else {
      throw new Error('Upload failed: Unknown error');
    }
  }
}

/**
 * Upload JSON metadata to IPFS via Pinata - simplified cast approach
 */
export async function uploadJSONToIPFS(jsonData: Record<string, unknown>): Promise<string> {
  try {
    // Check if we have API keys
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata API keys not configured. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY environment variables.');
    }
    
    console.log('Uploading metadata to IPFS:', jsonData);
    
    // Upload directly to Pinata
    const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      timeout: 30000, // 30 second timeout
    });

    if (response.data.IpfsHash) {
      const uri = `ipfs://${response.data.IpfsHash}`;
      console.log(`Metadata uploaded: ${uri}`);
      return uri;
    } else {
      throw new Error('No IPFS hash returned from metadata upload');
    }
  } catch (error: unknown) {
    console.error('Error uploading JSON to IPFS:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your Pinata API configuration.');
      } else {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(`Metadata upload failed: ${errorMessage}`);
      }
    } else if (error instanceof Error) {
      throw new Error(`Metadata upload failed: ${error.message}`);
    } else {
      throw new Error('Metadata upload failed: Unknown error');
    }
  }
} 