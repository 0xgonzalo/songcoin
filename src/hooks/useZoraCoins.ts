import { useState, useCallback } from 'react';
import { 
  createCoin, 
  createCoinCall,
  cleanAndValidateMetadataURI
} from '@zoralabs/coins-sdk';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { Address } from 'viem';
import axios from 'axios';

// Function to check if metadata is accessible via various gateways
async function prefetchMetadata(metadataURI: string): Promise<boolean> {
  const cid = metadataURI.replace('ipfs://', '');
  
  const gateways = [
    `https://ipfs.io/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://ipfs.filebase.io/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`
  ];
  
  console.log('Prefetching metadata from multiple gateways...');
  
  for (const gateway of gateways) {
    try {
      console.log(`Trying gateway: ${gateway}`);
      const response = await axios.get(gateway, { timeout: 5000 });
      
      if (response.status === 200 && response.data) {
        console.log('Successfully fetched metadata from gateway:', gateway);
        return true;
      }
    } catch (error) {
      console.log(`Gateway ${gateway} failed:`, error);
    }
  }
  
  console.warn('Metadata not accessible via IPFS gateways, but continuing...');
  return false;
}

// Cast repository CoinData interface (simplified for SDK 0.2.4)
export interface CoinData {
  name: string;
  symbol: string;
  uri: string;
  payoutRecipient: Address;
  platformReferrer?: Address;
  initialPurchaseWei?: bigint; // Optional, like in cast repository
  chainId?: number; // Add for SDK compatibility
}

export function useZoraCoins() {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [isCreatingCoin, setIsCreatingCoin] = useState(false);
  const [createCoinSuccess, setCreateCoinSuccess] = useState(false);
  const [createCoinError, setCreateCoinError] = useState<Error | null>(null);
  const [createdCoinAddress, setCreatedCoinAddress] = useState<Address | null>(null);
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | null>(null);
  
  /**
   * Create a new coin - SDK 0.2.4 approach
   */
  const createMusicCoin = useCallback(async (coinData: CoinData) => {
    if (!walletClient || !publicClient || !isConnected) {
      setCreateCoinError(new Error('Wallet not connected'));
      return;
    }

    setIsCreatingCoin(true);
    setCreateCoinSuccess(false);
    setCreateCoinError(null);
    setCreatedCoinAddress(null);

    try {
      console.log('Creating coin with data:', {
        name: coinData.name,
        symbol: coinData.symbol,
        payoutRecipient: coinData.payoutRecipient,
        uri: coinData.uri.substring(0, 50) + '...'
      });
      
      // Clean and validate the metadata URI using SDK function
      const validatedURI = cleanAndValidateMetadataURI(coinData.uri as unknown as Parameters<typeof cleanAndValidateMetadataURI>[0]) as unknown as string;
      
      // Check metadata accessibility
      await prefetchMetadata(coinData.uri);
      
      // Prepare coin data for SDK
      const sdkCoinData = {
        name: coinData.name,
        symbol: coinData.symbol,
        uri: validatedURI,
        payoutRecipient: coinData.payoutRecipient,
        platformReferrer: coinData.platformReferrer || "0x32C8ACD3118766CBE5c3E45a44BCEDde953EF627" as Address,
        chainId: coinData.chainId || 8453, // Default to Base mainnet
        ...(coinData.initialPurchaseWei && { initialPurchaseWei: coinData.initialPurchaseWei })
      };
      
      // Create the coin using SDK
      const result = await createCoin(sdkCoinData as Parameters<typeof createCoin>[0], walletClient, publicClient);
      
      if (result.address) {
        setCreatedCoinAddress(result.address);
      }
      
      setCreateCoinSuccess(true);
      
      if (result.hash) {
        setLastTxHash(result.hash);
      }
      
      console.log('Coin created successfully:', result);
      return result;
    } catch (error: unknown) {
      console.error('Error creating coin:', error);
      
      if (error instanceof Error) {
        setCreateCoinError(error);
      } else {
        setCreateCoinError(new Error('Unknown error occurred during coin creation'));
      }
      throw error;
    } finally {
      setIsCreatingCoin(false);
    }
  }, [walletClient, publicClient, isConnected]);
  
  /**
   * Get create coin call params for use with wagmi hooks
   */
  const getCreateCoinCallParams = useCallback((coinData: CoinData) => {
    const validatedURI = cleanAndValidateMetadataURI(coinData.uri as unknown as Parameters<typeof cleanAndValidateMetadataURI>[0]) as unknown as string;
    
    const sdkCoinData = {
      name: coinData.name,
      symbol: coinData.symbol,
      uri: validatedURI,
      payoutRecipient: coinData.payoutRecipient,
      platformReferrer: coinData.platformReferrer || "0x32C8ACD3118766CBE5c3E45a44BCEDde953EF627" as Address,
      chainId: coinData.chainId || 8453,
      ...(coinData.initialPurchaseWei && { initialPurchaseWei: coinData.initialPurchaseWei })
    } as Parameters<typeof createCoinCall>[0]; // Proper type casting
    
    return createCoinCall(sdkCoinData);
  }, []);

  return {
    // State
    isCreatingCoin,
    createCoinSuccess,
    createCoinError,
    createdCoinAddress,
    lastTxHash,
    
    // Functions
    createMusicCoin,
    getCreateCoinCallParams
  };
} 