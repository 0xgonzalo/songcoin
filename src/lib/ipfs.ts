/**
 * Convert an IPFS URL to a gateway URL
 */
export function getIpfsUrl(ipfsUrl: string): string {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }
  
  const ipfsHash = ipfsUrl.replace('ipfs://', '');
  return `https://ipfs.io/ipfs/${ipfsHash}`;
}

/**
 * Convert an IPFS URL to use a specific gateway
 */
export function getIpfsUrlWithGateway(ipfsUrl: string, gateway: string): string {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }
  
  const ipfsHash = ipfsUrl.replace('ipfs://', '');
  return `${gateway}/ipfs/${ipfsHash}`;
}

/**
 * List of popular IPFS gateways
 */
export const IPFS_GATEWAYS = [
  'https://ipfs.io',
  'https://gateway.pinata.cloud',
  'https://cloudflare-ipfs.com',
  'https://ipfs.filebase.io',
  'https://dweb.link'
];

/**
 * Try to fetch content from multiple IPFS gateways
 */
export async function fetchFromIPFS(ipfsUrl: string, timeout: number = 5000): Promise<Response | null> {
  if (!ipfsUrl.startsWith('ipfs://')) {
    throw new Error('Invalid IPFS URL');
  }

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = getIpfsUrlWithGateway(ipfsUrl, gateway);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, { 
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn(`Gateway ${gateway} failed:`, error);
      continue;
    }
  }
  
  return null;
} 