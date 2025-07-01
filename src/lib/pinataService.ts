import axios from 'axios';

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
    const isBrowser = typeof window !== 'undefined';
    
    // Check if we're running in development or production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Verify API keys are available
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata API keys are not configured. Please set them in your environment variables.');
    }
    
    // Get the file size in MB
    const fileSizeMB = file.size / (1024 * 1024);
    const isLargeFile = fileSizeMB > 10; // Consider files over 10MB as large
    
    // For large files, use direct API in both environments
    if (isLargeFile) {
      console.log('Large file detected, using direct Pinata API');
      
      // Create a form data object
      const formData = new FormData();
      formData.append('file', file);
      
      // Send the file to Pinata
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (onProgress) onProgress(percentCompleted);
          }
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 60000 // 60 second timeout
      });
      
      // Return the IPFS CID
      return `ipfs://${response.data.IpfsHash}`;
    }
    // Use direct API call in development, proxy API in production
    else if (isBrowser && !isDevelopment) {
      // In production, use our API proxy to avoid CORS issues for smaller files
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await axios.post('/api/pinata/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              if (onProgress) onProgress(percentCompleted);
            }
          }
        });
        
        return `ipfs://${response.data.IpfsHash}`;
      } catch (proxyError: any) {
        // If we get a 413 error, fall back to direct API
        if (proxyError.response?.status === 413) {
          console.log('API proxy returned 413, falling back to direct API');
          
          // Create a form data object
          const formData = new FormData();
          formData.append('file', file);
          
          // Send the file to Pinata
          const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'pinata_api_key': PINATA_API_KEY,
              'pinata_secret_api_key': PINATA_SECRET_KEY
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                if (onProgress) onProgress(percentCompleted);
              }
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
          });
          
          // Return the IPFS CID
          return `ipfs://${response.data.IpfsHash}`;
        }
        
        // If it's not a 413 error, rethrow
        throw proxyError;
      }
    } else {
      // In development, call Pinata API directly
      // Create a form data object
      const formData = new FormData();
      formData.append('file', file);
      
      // Send the file to Pinata
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (onProgress) onProgress(percentCompleted);
          }
        }
      });
      
      // Return the IPFS CID
      return `ipfs://${response.data.IpfsHash}`;
    }
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

/**
 * Upload JSON metadata to IPFS
 */
export async function uploadJSONToIPFS(metadata: any): Promise<string> {
  try {
    // Strict validation for Zora metadata requirements
    if (!metadata.name) {
      throw new Error('Metadata must include a name field');
    }
    
    if (!metadata.image) {
      throw new Error('Metadata must include an image field');
    }
    
    if (!metadata.description) {
      throw new Error('Metadata must include a description field');
    }
    
    // Ensure proper IPFS URI formatting
    if (metadata.image) {
      // Remove any 'ipfs://' prefix and ensure consistent format
      const cleanImageCid = metadata.image.replace('ipfs://', '');
      metadata.image = `ipfs://${cleanImageCid}`;
    }
    
    if (metadata.animation_url) {
      // Remove any 'ipfs://' prefix and ensure consistent format
      const cleanAnimationCid = metadata.animation_url.replace('ipfs://', '');
      metadata.animation_url = `ipfs://${cleanAnimationCid}`;
    }
    
    // Ensure we have attributes
    if (!Array.isArray(metadata.attributes) || metadata.attributes.length === 0) {
      console.warn('Adding default attributes as none were provided');
      metadata.attributes = [
        {
          trait_type: "Type",
          value: "Music"
        }
      ];
    }
    
    // Make sure the schema follows exactly what Zora expects
    const cleanedMetadata = {
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      animation_url: metadata.animation_url,
      external_url: metadata.external_url || "",
      properties: {},  // Add empty properties object
      attributes: metadata.attributes
    };
    
    // Log the final metadata being uploaded
    console.log('Uploading metadata to IPFS:', JSON.stringify(cleanedMetadata, null, 2));
    
    // Detect if we're in a browser environment (client-side)
    const isBrowser = typeof window !== 'undefined';
    
    // Check if we're running in development or production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // In production, use our API proxy to avoid CORS issues
    if (isBrowser && !isDevelopment) {
      const response = await axios.post('/api/pinata/json', cleanedMetadata, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      return `ipfs://${response.data.IpfsHash}`;
    } else {
      // In development, call Pinata API directly
      const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', cleanedMetadata, {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      });
      
      return `ipfs://${response.data.IpfsHash}`;
    }
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
} 