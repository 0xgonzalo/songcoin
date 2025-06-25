import { useState, useCallback } from 'react';
import { 
  createCoin, 
  createCoinCall,
  tradeCoin, 
  tradeCoinCall,
  simulateBuy
} from '@zoralabs/coins-sdk';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { Address } from 'viem';
import axios from 'axios';

// Function to check if metadata is accessible (simplified from cast)
async function prefetchMetadata(metadataURI: string): Promise<boolean> {
  const cid = metadataURI.replace('ipfs://', '');
  
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`
  ];
  
  console.log('Checking metadata accessibility...');
  
  for (const gateway of gateways) {
    try {
      const response = await axios.get(gateway, { timeout: 5000 });
      if (response.status === 200 && response.data) {
        console.log('Metadata accessible via:', gateway);
        return true;
      }
    } catch {
      console.log(`Gateway ${gateway} failed`);
    }
  }
  
  console.warn('Metadata not immediately accessible, but continuing...');
  return false;
}

export interface CoinData {
  name: string;
  symbol: string;
  uri: string;
  payoutRecipient: Address;
  platformReferrer: "0x32C8ACD3118766CBE5c3E45a44BCEDde953EF627";
  initialPurchaseWei?: bigint;
  chainId?: number;
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
  const { address, isConnected, chainId } = useAccount();
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
   * Create a new coin - simplified cast approach
   */
  const createMusicCoin = useCallback(async (coinData: CoinData) => {
    if (!walletClient || !publicClient || !isConnected || !address) {
      throw new Error('Wallet not connected');
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
      
      // Validate URI format
      if (!coinData.uri.startsWith('ipfs://')) {
        throw new Error('Invalid URI format - must start with ipfs://');
      }
      
      // Validate address format
      if (!coinData.payoutRecipient || coinData.payoutRecipient.length !== 42 || !coinData.payoutRecipient.startsWith('0x')) {
        throw new Error(`Invalid payout recipient address: ${coinData.payoutRecipient}`);
      }
      
      // Check metadata accessibility
      await prefetchMetadata(coinData.uri);
      
      // Use the provided chainId or default to Base mainnet
      const finalCoinData = {
        ...coinData,
        chainId: coinData.chainId || chainId || 8453
      };
      
      // Create the coin using the SDK
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
        setCreateCoinError(new Error('Unknown error occurred'));
      }
      throw error;
    } finally {
      setIsCreatingCoin(false);
    }
  }, [walletClient, publicClient, isConnected, address, chainId]);
  
  /**
   * Get create coin call params for use with wagmi hooks
   */
  const getCreateCoinCallParams = useCallback((coinData: CoinData) => {
    const finalCoinData = {
      ...coinData,
      chainId: coinData.chainId || chainId || 8453
    };
    return createCoinCall(finalCoinData);
  }, [chainId]);
  
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
        setTradeError(new Error('Unknown error occurred'));
      }
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
        requestedOrderSize: orderSize,
        publicClient,
      });
      
      return result;
    } catch (error: unknown) {
      console.error('Error simulating buy:', error);
      throw error;
    }
  }, [publicClient]);

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