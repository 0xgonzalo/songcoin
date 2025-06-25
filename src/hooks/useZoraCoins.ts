import { useState, useCallback } from 'react';
import { 
  createCoin, 
  createCoinCall,
  tradeCoin, 
  tradeCoinCall,
  simulateBuy,
  DeployCurrency
} from '@zoralabs/coins-sdk';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { Address, parseEther, formatEther } from 'viem';
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

// Official Zora SDK CreateCoinArgs interface (from docs)
export interface CoinData {
  name: string;
  symbol: string;
  uri: string;
  chainId?: number;
  owners?: Address[];
  payoutRecipient: Address;
  platformReferrer?: Address;
  currency?: DeployCurrency;
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
  const { isConnected } = useAccount();
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
   * Create a new coin - official Zora SDK approach
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
      
      // Verify that the URI is valid
      if (!coinData.uri.startsWith('ipfs://')) {
        throw new Error('Invalid URI format - must start with ipfs://');
      }
      
      // Check metadata accessibility
      await prefetchMetadata(coinData.uri);
      
      // Prepare coin data with required defaults
      const finalCoinData = {
        ...coinData,
        chainId: coinData.chainId || 8453, // Default to Base mainnet
      };
      
      // Use official Zora SDK parameters exactly as documented
      const result = await createCoin(finalCoinData, walletClient, publicClient);
      
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
    // Prepare coin data with required defaults
    const finalCoinData = {
      ...coinData,
      chainId: coinData.chainId || 8453, // Default to Base mainnet
    };
    return createCoinCall(finalCoinData);
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
      const result = await tradeCoin(tradeParams, walletClient, publicClient);
      
      setTradeSuccess(true);
      
      if (result.hash) {
        setLastTxHash(result.hash);
      }
      
      return result;
    } catch (error: unknown) {
      console.error('Error trading coin:', error);
      if (error instanceof Error) {
        setTradeError(error);
      } else {
        setTradeError(new Error('Unknown error occurred during trading'));
      }
      throw error;
    } finally {
      setIsTrading(false);
    }
  }, [walletClient, publicClient, isConnected]);
  
  /**
   * Get trade coin call params for use with wagmi hooks
   */
  const getTradeCallParams = useCallback((tradeParams: TradeParams) => {
    return tradeCoinCall(tradeParams);
  }, []);
  
  /**
   * Simulate buying a coin to get expected output
   */
  const simulateBuyCoin = useCallback(async (
    target: Address, 
    orderSizeEth: string
  ) => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }
    
    try {
      const result = await simulateBuy({
        target,
        requestedOrderSize: parseEther(orderSizeEth),
        publicClient,
      });
      
      return {
        ...result,
        formattedAmountOut: formatEther(result.amountOut)
      };
    } catch (error) {
      console.error('Error simulating buy:', error);
      throw error;
    }
  }, [publicClient]);

  return {
    // State
    isCreatingCoin,
    createCoinSuccess,
    createCoinError,
    createdCoinAddress,
    isTrading,
    tradeSuccess,
    tradeError,
    lastTxHash,
    
    // Functions
    createMusicCoin,
    getCreateCoinCallParams,
    tradeMusicCoin,
    getTradeCallParams,
    simulateBuyCoin
  };
} 