'use client';

import React, { useMemo } from 'react';
import { MiniAppProvider } from '@neynar/react';
import '@neynar/react/dist/style.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base as appkitBase, type AppKitNetwork } from '@reown/appkit/networks'; // <-- type comes from here

import DarkModeToggle from '~/components/ui/DarkModeToggle';

// Ensure web components (e.g. <appkit-connect-button />) are registered once
import '@reown/appkit/react/core/components';

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '';
if (!projectId) {
  console.error('Missing NEXT_PUBLIC_WC_PROJECT_ID');
}

// Clone to drop readonly & satisfy mutable tuple requirement
const baseNetwork: AppKitNetwork = { ...appkitBase };
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [baseNetwork];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

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

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MiniAppProvider analyticsEnabled={false}>
          {/* Left: WalletConnect / AppKit button */}
          <div className="fixed top-4 left-4 z-50">
            <appkit-connect-button />
          </div>

          {/* Right: dark mode toggle */}
          <div className="fixed top-4 right-4 z-50">
            <DarkModeToggle />
          </div>

          {children}
        </MiniAppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}