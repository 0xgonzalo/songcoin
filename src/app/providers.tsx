"use client";

import dynamic from "next/dynamic";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { MiniAppProvider } from "@neynar/react";
import { SafeFarcasterSolanaProvider } from "~/components/providers/SafeFarcasterSolanaProvider";
import { MiniKitProvider } from "~/components/providers/MiniKitProvider";

const WagmiProvider = dynamic(
  () => import("~/components/providers/WagmiProvider"),
  {
    ssr: false,
  }
);

export function Providers({ session, children }: { session: Session | null, children: React.ReactNode }) {
  const solanaEndpoint = process.env.SOLANA_RPC_ENDPOINT || "https://solana-rpc.publicnode.com";
  return (
    <SessionProvider session={session}>
      <MiniKitProvider>
        <WagmiProvider>
          <MiniAppProvider analyticsEnabled={true}>
            <SafeFarcasterSolanaProvider endpoint={solanaEndpoint}>
              {children}
            </SafeFarcasterSolanaProvider>
          </MiniAppProvider>
        </WagmiProvider>
      </MiniKitProvider>
    </SessionProvider>
  );
}
