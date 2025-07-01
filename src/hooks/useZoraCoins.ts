import { useState, useCallback } from 'react';
import { 
  createCoin, 
  createCoinCall
} from '@zoralabs/coins-sdk';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { Address } from 'viem';

export interface CoinData {
  name: string;
  symbol: string;
  uri: string;
  payoutRecipient: Address;
  platformReferrer: "0x32C8ACD3118766CBE5c3E45a44BCEDde953EF627";
  initialPurchaseWei?: bigint;
}

export function useZoraCoins() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [isCreatingCoin, setIsCreatingCoin] = useState(false);
  const [createCoinSuccess, setCreateCoinSuccess] = useState(false);
  const [createCoinError, setCreateCoinError] = useState<Error | null>(null);
  const [createdCoinAddress, setCreatedCoinAddress] = useState<Address | null>(null);
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
      // Create the coin using the SDK (same pattern as cast repository)
      // Cast to unknown then to the expected type to handle TypeScript validation
      const result = await createCoin(coinData as unknown as Parameters<typeof createCoin>[0], walletClient, publicClient);
      
      if (result.address) {
        setCreatedCoinAddress(result.address);
      }
      
      setCreateCoinSuccess(true);
      
      if (result.hash) {
        setLastTxHash(result.hash);
      }
      
      return result;
    } catch (error) {
      console.error('Error creating coin:', error);
      const errorMessage = error instanceof Error ? error : new Error('Failed to create coin');
      setCreateCoinError(errorMessage);
      throw errorMessage;
    } finally {
      setIsCreatingCoin(false);
    }
  }, [walletClient, publicClient, isConnected]);
  
  /**
   * Get create coin call params for use with wagmi hooks
   */
  const createCoinTransaction = useCallback((coinData: CoinData) => {
    return createCoinCall(coinData as unknown as Parameters<typeof createCoinCall>[0]);
  }, []);

  return {
    // Coin creation
    createMusicCoin,
    createCoinTransaction,
    isCreatingCoin,
    createCoinSuccess,
    createCoinError,
    createdCoinAddress,
    
    // General
    lastTxHash,
    isConnected,
    address
  };
} 