'use client';

import { useEffect } from 'react';
import { AppKitButton, useAppKitAccount } from '@reown/appkit/react';

export type ConnectWalletProps = {
  onAddressesChange?: (addresses: string[]) => void;
};

export default function ConnectWallet({ onAddressesChange }: ConnectWalletProps) {
  const { address, isConnected } = useAppKitAccount();

  // Bubble the connected EOA (if any) as a 1-item array for your existing code paths
  useEffect(() => {
    const list = address ? [address.toLowerCase()] : [];
    onAddressesChange?.(list);
  }, [address, isConnected, onAddressesChange]);

  return (
    <div className="flex items-center gap-3">
      <AppKitButton />
    </div>
  );
}