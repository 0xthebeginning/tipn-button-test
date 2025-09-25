'use client';

import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected({ shimDisconnect: true }),
    // WalletConnect connector is provided by AppKit at runtime
  ],
  transports: {
    [base.id]: http(), // public; AppKit uses WC infra internally
  },
});