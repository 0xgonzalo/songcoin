import { useState, useCallback } from 'react';
import { 
  createCoin
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
      // Create the coin using the SDK - cast the coinData to match SDK expectations
      const result = await createCoin(coinData as Parameters<typeof createCoin>[0], walletClient, publicClient);
      
      if (result.address) {
        setCreatedCoinAddress(result.address);
      }
      
      setCreateCoinSuccess(true);
      
      return result;
    } catch (error: unknown) {
      console.error('Error creating coin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create coin';
      setCreateCoinError(new Error(errorMessage));
      throw error;
    } finally {
      setIsCreatingCoin(false);
    }
  }, [walletClient, publicClient, isConnected]);

  return {
    createMusicCoin,
    isCreatingCoin,
    createCoinSuccess,
    createCoinError,
    createdCoinAddress
  };
} 