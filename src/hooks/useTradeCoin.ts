"use client";

import { useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { Address, parseEther } from 'viem';
import { tradeCoin, TradeParameters } from '@zoralabs/coins-sdk';

export interface TradeResult {
  hash: `0x${string}`;
  status: 'success' | 'pending' | 'failed';
}

export function useTradeCoin() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isTrading, setIsTrading] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState(false);
  const [tradeError, setTradeError] = useState<Error | null>(null);
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | null>(null);

  /**
   * Execute a trade (buy/sell) using Zora SDK
   */
  const executeTrade = useCallback(async (tradeParameters: TradeParameters): Promise<TradeResult> => {
    if (!walletClient || !publicClient || !isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsTrading(true);
    setTradeSuccess(false);
    setTradeError(null);
    setLastTxHash(null);

    try {
      const result = await tradeCoin({
        tradeParameters,
        walletClient,
        account: walletClient.account,
        publicClient,
      });
      setTradeSuccess(true);
      if (result.hash) setLastTxHash(result.hash);
      return {
        hash: result.hash,
        status: 'success',
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        setTradeError(error);
        throw error;
      } else {
        setTradeError(new Error('Trade failed'));
        throw new Error('Trade failed');
      }
    } finally {
      setIsTrading(false);
    }
  }, [walletClient, publicClient, isConnected, address]);

  /**
   * Buy coins with ETH
   */
  const buyCoins = useCallback(async (
    coinAddress: Address,
    ethAmount: string,
    slippage: number = 1
  ): Promise<TradeResult> => {
    if (!address) throw new Error('Wallet not connected');
    const tradeParameters: TradeParameters = {
      sell: { type: 'eth' },
      buy: { type: 'erc20', address: coinAddress },
      amountIn: parseEther(ethAmount),
      slippage: slippage / 100, // e.g. 1% -> 0.01
      sender: address,
    };
    return executeTrade(tradeParameters);
  }, [address, executeTrade]);

  /**
   * Sell coins for ETH
   */
  const sellCoins = useCallback(async (
    coinAddress: Address,
    coinAmount: string,
    slippage: number = 1
  ): Promise<TradeResult> => {
    if (!address) throw new Error('Wallet not connected');
    const tradeParameters: TradeParameters = {
      sell: { type: 'erc20', address: coinAddress },
      buy: { type: 'eth' },
      amountIn: parseEther(coinAmount),
      slippage: slippage / 100, // e.g. 1% -> 0.01
      sender: address,
    };
    return executeTrade(tradeParameters);
  }, [address, executeTrade]);

  return {
    isTrading,
    tradeSuccess,
    tradeError,
    lastTxHash,
    buyCoins,
    sellCoins,
    executeTrade,
  };
} 