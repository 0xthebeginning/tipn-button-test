'use client';

import { useEffect, useState } from 'react';
import { getWallets } from '@wallet-standard/app';
import type { Wallet } from '@wallet-standard/base';

// Strictly typed Wallet with label
interface LabeledWallet extends Wallet {
  label: string;
}

// Runtime type guard
function isLabeledWallet(wallet: Wallet): wallet is LabeledWallet {
  return typeof (wallet as unknown as Record<string, unknown>).label === 'string';
}

export default function WalletStandardDebug() {
  const [walletLabels, setWalletLabels] = useState<string[]>([]);

  useEffect(() => {
    const detectWallets = async () => {
      try {
        const walletsInterface = await getWallets();
        const walletsArray = [...walletsInterface.get()]; // readonly → mutable copy

        walletsArray.forEach((wallet, i) => {
          console.log(`📦 Wallet ${i + 1}:`, wallet);

          if (isLabeledWallet(wallet)) {
            console.log(`🔖 Label: ${wallet.label}`);
          }

          console.log(`🔗 Chains:`, wallet.chains);
          console.log(`👛 Accounts:`, wallet.accounts);
          console.log(`⚙️ Features:`, wallet.features);
        });

        const labels = walletsArray.map((wallet) =>
          isLabeledWallet(wallet) ? wallet.label : 'Unnamed Wallet'
        );

        console.log('🧠 Wallets detected via Wallet Standard:', walletsArray);
        setWalletLabels(labels);
      } catch (err) {
        console.error('❌ Wallet detection failed:', err);
      }
    };

    detectWallets();
  }, []);

  return (
    <div className="p-4 text-sm text-white bg-black/20 rounded-xl mt-4">
      <h2 className="text-md font-semibold">Wallet Standard Debug</h2>
      {walletLabels.length > 0 ? (
        <ul className="mt-2 list-disc list-inside">
          {walletLabels.map((label, idx) => (
            <li key={idx}>{label}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-gray-400">
          No Wallet Standard providers found.
        </p>
      )}
    </div>
  );
}