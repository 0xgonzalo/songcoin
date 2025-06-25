import { useState, useCallback } from 'react';
import { 
  createCoin, 
  createCoinCall,
  tradeCoin, 
  tradeCoinCall,
  simulateBuy
} from '@zoralabs/coins-sdk';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther, Address } from 'viem';
import axios from 'axios';

// Function to check if metadata is accessible via various gateways before creating the coin
async function prefetchMetadata(metadataURI: string): Promise<boolean> {
  // Extract CID from the ipfs:// URI
  const cid = metadataURI.replace('ipfs://', '');
  
  // List of gateways to try (including the one Zora uses)
  const gateways = [
    `https://ipfs.io/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://sapphire-raw-hawk-781.mypinata.cloud/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://ipfs.filebase.io/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`
  ];
  
  console.log('Prefetching metadata from multiple gateways...');
  
  // Try each gateway
  for (const gateway of gateways) {
    try {
      console.log(`Trying gateway: ${gateway}`);
      const response = await axios.get(gateway, { timeout: 5000 });
      
      if (response.status === 200 && response.data) {
        console.log('Successfully fetched metadata from gateway:', gateway);
        console.log('Metadata:', response.data);
        return true;
      }
    } catch (error) {
      console.log(`Gateway ${gateway} failed:`, error);
    }
  }
  
  console.error('Failed to prefetch metadata from any gateway');
  return false;
}

export interface CoinData {
  name: string;
  symbol: string;
  uri: string;
  payoutRecipient: Address;
  platformReferrer: "0x32C8ACD3118766CBE5c3E45a44BCEDde953EF627";
  initialPurchaseWei?: bigint;
}

export interface TradeParams {
  direction: "sell" | "buy";
  target: Address;
  args: {
    recipient: Address;
    orderSize: bigint;
    minAmountOut?: bigint;
    sqrtPriceLimitX96?: bigint;
    tradeReferrer?: Address;
  };
}

export function useZoraCoins() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [isCreatingCoin, setIsCreatingCoin] = useState(false);
  const [createCoinSuccess, setCreateCoinSuccess] = useState(false);
  const [createCoinError, setCreateCoinError] = useState<Error | null>(null);
  const [createdCoinAddress, setCreatedCoinAddress] = useState<Address | null>(null);
  
  const [isTrading, setIsTrading] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState(false);
  const [tradeError, setTradeError] = useState<Error | null>(null);
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | null>(null);
  
  /**
   * Create a new coin
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
      // Log the coinData for debugging
      console.log('Creating coin with data:', {
        ...coinData,
        // Remove large URI from log
        uri: coinData.uri.substring(0, 50) + '...'
      });
      
      // Verify that the URI is valid
      if (!coinData.uri.startsWith('ipfs://')) {
        throw new Error('Invalid URI format - must start with ipfs://');
      }
      
      // Prefetch metadata to ensure it's accessible before creating the coin
      const metadataAccessible = await prefetchMetadata(coinData.uri);
      if (!metadataAccessible) {
        console.warn('Metadata not accessible via IPFS gateways. Continuing with creation...');
      }
      
      // Create the coin using the SDK
      const result = await createCoin(coinData, walletClient, publicClient);
      
      if (result.address) {
        setCreatedCoinAddress(result.address);
      }
      
      setCreateCoinSuccess(true);
      
      if (result.hash) {
        setLastTxHash(result.hash);
      }
      
      return result;
    } catch (error: any) {
      console.error('Error creating coin:', error);
      // Provide more detailed error information
      if (error.message.includes('Metadata fetch failed')) {
        console.error('Metadata validation failed. Please check the URI and metadata format.');
        setCreateCoinError(new Error('Metadata validation failed: Please ensure your metadata follows the correct format and is accessible'));
      } else {
        setCreateCoinError(error);
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
    return createCoinCall(coinData);
  }, []);
  
  /**
   * Trade (buy/sell) a coin
   */
  const tradeMusicCoin = useCallback(async (tradeParams: TradeParams) => {
    if (!walletClient || !publicClient || !isConnected) {
      setTradeError(new Error('Wallet not connected'));
      return;
    }

    setIsTrading(true);
    setTradeSuccess(false);
    setTradeError(null);

    try {
      // Execute the trade using the SDK
      const result = await tradeCoin(tradeParams, walletClient, publicClient);
      
      setTradeSuccess(true);
      
      if (result.hash) {
        setLastTxHash(result.hash);
      }
      
      return result;
    } catch (error: any) {
      console.error('Error trading coin:', error);
      setTradeError(error);
      throw error;
    } finally {
      setIsTrading(false);
    }
  }, [walletClient, publicClient, isConnected]);
  
  /**
   * Get trade call params for use with wagmi hooks
   */
  const getTradeCoinCallParams = useCallback((tradeParams: TradeParams) => {
    return tradeCoinCall(tradeParams);
  }, []);
  
  /**
   * Simulate a buy to get price information
   */
  const simulateBuyCoin = useCallback(async (target: Address, orderSize: bigint) => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    try {
      const result = await simulateBuy({
        target,
        orderSize,
        recipient: address || '0x0000000000000000000000000000000000000000',
      }, publicClient);
      
      return result;
    } catch (error: any) {
      console.error('Error simulating buy:', error);
      throw error;
    }
  }, [publicClient, address]);

  return {
    // Coin creation
    createMusicCoin,
    getCreateCoinCallParams,
    isCreatingCoin,
    createCoinSuccess,
    createCoinError,
    createdCoinAddress,
    
    // Trading
    tradeMusicCoin,
    getTradeCoinCallParams,
    simulateBuyCoin,
    isTrading,
    tradeSuccess,
    tradeError,
    
    // General
    lastTxHash,
  };
} 