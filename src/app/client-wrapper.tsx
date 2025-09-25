// src/app/client-wrapper.tsx
'use client';

import { useMemo } from 'react';
import { MiniAppProvider } from '@neynar/react';
import '@neynar/react/dist/style.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base as appkitBase, type AppKitNetwork } from '@reown/appkit/networks';

import DarkModeToggle from '~/components/ui/DarkModeToggle';

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;
if (!projectId) {
  console.error('Missing NEXT_PUBLIC_WC_PROJECT_ID');
}

// Ensure AppKit/Wagmi are only initialized once (handles HMR, multiple imports)
declare global {
  // eslint-disable-next-line no-var
  var __appkit_inited__: boolean | undefined;
  // eslint-disable-next-line no-var
  var __wagmi_adapter__: WagmiAdapter | undefined;
}

const networks = [appkitBase] as [AppKitNetwork, ...AppKitNetwork[]];

if (!globalThis.__appkit_inited__ && projectId) {
  const wagmiAdapter =
    globalThis.__wagmi_adapter__ ??
    new WagmiAdapter({
      projectId,
      networks,
      ssr: true,
    });

  // stash for reuse
  globalThis.__wagmi_adapter__ = wagmiAdapter;

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

  globalThis.__appkit_inited__ = true;
}

// Export wagmi config from the (singleton) adapter
export const wagmiConfig = (globalThis.__wagmi_adapter__ as WagmiAdapter).wagmiConfig;

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);

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