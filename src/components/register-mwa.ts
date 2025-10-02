'use client';

import {
  createDefaultAuthorizationCache,
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler,
  registerMwa,
} from '@solana-mobile/wallet-standard-mobile';

// Only register once on client
export function registerMobileWalletAdapter() {
  registerMwa({
    appIdentity: {
      name: 'SuperInu',
      uri: 'https://superinu-miniapp.vercel.app/',
      icon: '/icon.png', // or a valid external image URL
    },
    authorizationCache: createDefaultAuthorizationCache(),
    chains: ['solana:mainnet'],
    chainSelector: createDefaultChainSelector(),
    onWalletNotFound: createDefaultWalletNotFoundHandler(),
  });
}