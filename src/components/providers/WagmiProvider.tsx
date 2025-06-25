import { createConfig, http, WagmiProvider } from "wagmi";
import { base, degen, mainnet, optimism, unichain, celo } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { coinbaseWallet, metaMask } from 'wagmi/connectors';
import { APP_NAME, APP_ICON_URL, APP_URL } from "~/lib/constants";
import { useEffect, useState } from "react";
import { useConnect, useAccount } from "wagmi";
import { useMiniApp } from "@neynar/react";
import React from "react";

// Custom hook for Farcaster Frame auto-connection
function useFarcasterAutoConnect() {
  const [isFarcasterFrame, setIsFarcasterFrame] = useState(false);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const { context } = useMiniApp();

  useEffect(() => {
    // Check if we're in a Farcaster Frame context
    const checkFarcasterFrame = () => {
      const isInFarcaster = !!context?.user?.fid || 
        window.location.href.includes('farcaster') ||
        window.parent !== window; // Basic frame detection
      setIsFarcasterFrame(isInFarcaster);
    };
    
    checkFarcasterFrame();
    
    // Listen for context changes
    if (context) {
      setIsFarcasterFrame(!!context.user?.fid);
    }
  }, [context]);

  useEffect(() => {
    // Auto-connect Farcaster Frame connector if in Farcaster context and not already connected
    if (isFarcasterFrame && !isConnected && context?.user?.fid && !connectionAttempted) {
      const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame');
      if (farcasterConnector) {
        console.log('Auto-connecting Farcaster wallet...');
        connect({ connector: farcasterConnector });
        setConnectionAttempted(true);
      }
    }
  }, [isFarcasterFrame, isConnected, connect, connectors, context, connectionAttempted]);

  return isFarcasterFrame;
}

// Custom hook for Coinbase Wallet detection and auto-connection
function useCoinbaseWalletAutoConnect() {
  const [isCoinbaseWallet, setIsCoinbaseWallet] = useState(false);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const { context } = useMiniApp();

  useEffect(() => {
    // Check if we're running in Coinbase Wallet
    const checkCoinbaseWallet = () => {
      const isInCoinbaseWallet = window.ethereum?.isCoinbaseWallet || 
        window.ethereum?.isCoinbaseWalletExtension ||
        window.ethereum?.isCoinbaseWalletBrowser;
      setIsCoinbaseWallet(!!isInCoinbaseWallet);
    };
    
    checkCoinbaseWallet();
    window.addEventListener('ethereum#initialized', checkCoinbaseWallet);
    
    return () => {
      window.removeEventListener('ethereum#initialized', checkCoinbaseWallet);
    };
  }, []);

  useEffect(() => {
    // Only auto-connect Coinbase if not in Farcaster context and not already connected
    const hasFarcasterContext = !!context?.user?.fid;
    if (isCoinbaseWallet && !isConnected && !hasFarcasterContext && !connectionAttempted) {
      const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWallet');
      if (coinbaseConnector) {
        console.log('Auto-connecting Coinbase Wallet...');
        connect({ connector: coinbaseConnector });
        setConnectionAttempted(true);
      }
    }
  }, [isCoinbaseWallet, isConnected, connect, connectors, context, connectionAttempted]);

  return isCoinbaseWallet;
}

export const config = createConfig({
  chains: [base, optimism, mainnet, degen, unichain, celo],
  transports: {
    [base.id]: http(),
    [optimism.id]: http(),
    [mainnet.id]: http(),
    [degen.id]: http(),
    [unichain.id]: http(),
    [celo.id]: http(),
  },
  connectors: [
    farcasterFrame(),
    coinbaseWallet({
      appName: APP_NAME,
      appLogoUrl: APP_ICON_URL,
      preference: 'all',
    }),
    metaMask({
      dappMetadata: {
        name: APP_NAME,
        url: APP_URL,
      },
    }),
  ],
});

const queryClient = new QueryClient();

// Wrapper component that provides auto-connection for both Farcaster and Coinbase Wallet
function AutoConnectWallets({ children }: { children: React.ReactNode }) {
  useFarcasterAutoConnect();
  useCoinbaseWalletAutoConnect();
  return <>{children}</>;
}

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AutoConnectWallets>
          {children}
        </AutoConnectWallets>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
