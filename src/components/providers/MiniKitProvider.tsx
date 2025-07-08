'use client'

import { ReactNode } from 'react'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base } from 'viem/chains'

interface MiniKitProviderProps {
  children: ReactNode
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ''
  const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID || ''

  return (
    <OnchainKitProvider 
      apiKey={apiKey}
      chain={base}
      projectId={projectId}
    >
      {children}
    </OnchainKitProvider>
  )
} 