// src/app/client-wrapper.tsx
'use client';

import { useMemo } from 'react';
import { MiniAppProvider } from '@neynar/react';
import '@neynar/react/dist/style.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { createAppKit, useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base as appkitBase } from '@reown/appkit/networks';

import DarkModeToggle from '~/components/ui/DarkModeToggle';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
if (!projectId) {
  console.error('Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
}

/** 
 * Tuple for AppKit (required type is [AppKitNetwork, ...AppKitNetwork[]]).
 * Also make a mutable array copy for WagmiAdapter (expects AppKitNetwork[]).
 */
const networksTuple = [appkitBase] as [typeof appkitBase];
const networksArray = [...networksTuple];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: networksArray,
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

createAppKit({
  projectId,
  adapters: [wagmiAdapter],
  networks: networksTuple,
  themeMode: 'dark',
  features: { analytics: false },
  metadata: {
    name: 'SuperInu',
    description: 'Create and share custom SuperInu memes!',
    url: 'https://superinu-miniapp.vercel.app',
    icons: ['https://superinu-miniapp.vercel.app/splash.png'],
  },
});

/** Minimal connect button using AppKit hooks */
function ConnectWalletButton() {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();
  const short = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '');

  return (
    <button
      onClick={() => open({ view: 'Connect' })}
      className="px-3 py-1.5 rounded-md bg-black/80 text-white text-sm hover:bg-black/70 dark:bg-white/10 dark:text-white"
    >
      {isConnected && address ? short(address) : 'Connect'}
    </button>
  );
}

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MiniAppProvider analyticsEnabled={false}>
          {/* Top-right: dark mode toggle */}
          <div className="fixed top-4 right-4 z-50">
            <DarkModeToggle />
          </div>

          {/* Top-left: wallet connect */}
          <div className="fixed top-4 left-4 z-50">
            <ConnectWalletButton />
          </div>

          {children}
        </MiniAppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}