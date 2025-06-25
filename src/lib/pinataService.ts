import axios, { AxiosError } from 'axios';

export function getIpfsUrl(ipfsUrl: string): string {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }
  
  const ipfsHash = ipfsUrl.replace('ipfs://', '');
  return `https://ipfs.io/ipfs/${ipfsHash}`;
}

/**
 * Upload a file to IPFS via Pinata
 */
export async function uploadFileToIPFS(
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('/api/pinata/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
    });

    if (response.data.IpfsHash) {
      return response.data.IpfsHash;
    } else {
      throw new Error('No IPFS hash returned from upload');
    }
  } catch (error: unknown) {
    console.error('Error uploading file to IPFS:', error);
    
    if (error instanceof AxiosError) {
      if (error.response?.status === 413) {
        throw new Error('File too large for upload. Please use a smaller file.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your Pinata API configuration.');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    } else if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    } else {
      throw new Error('Upload failed: Unknown error');
    }
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
        throw new Error(`JSON upload failed: ${error.message}`);
      }
    } else if (error instanceof Error) {
      throw new Error(`JSON upload failed: ${error.message}`);
    } else {
      throw new Error('JSON upload failed: Unknown error');
    }
  }
} 