// src/app/client-wrapper.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { MiniAppProvider } from '@neynar/react';
import '@neynar/react/dist/style.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base as appkitBase, type AppKitNetwork } from '@reown/appkit/networks';

import DarkModeToggle from '~/components/ui/DarkModeToggle';

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!projectId) {
  console.warn('NEXT_PUBLIC_WC_PROJECT_ID missing; WalletConnect modal will be disabled.');
}

// ✅ Type the networks tuple as AppKitNetwork
const networks = [appkitBase] as [AppKitNetwork, ...AppKitNetwork[]];

const wagmiAdapter = new WagmiAdapter({
  projectId: projectId ?? 'placeholder',
  networks,
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

let appkitInitialized = false;

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    if (appkitInitialized) return;
    if (!projectId) return;

    try {
      createAppKit({
        projectId,
        adapters: [wagmiAdapter],
        networks,
        themeMode: 'dark',
        features: { analytics: false },
        metadata: {
          name: 'SuperInu',
          description: 'Create and share custom SuperInu memes!',
          url: 'https://superinu-miniapp.vercel.app',
          icons: ['https://superinu-miniapp.vercel.app/splash.png'],
        },
      });
      appkitInitialized = true;
    } catch (e) {
      console.error('AppKit init failed:', e);
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MiniAppProvider analyticsEnabled={false}>
          <div className="fixed top-4 right-4 z-50">
            <DarkModeToggle />
          </div>
          {children}
        </MiniAppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}