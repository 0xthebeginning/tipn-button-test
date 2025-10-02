'use client';

import { useEffect, useState } from 'react';
import { getWallets } from '@wallet-standard/app';
import type { Wallet } from '@wallet-standard/base';

// Optional: if some wallets do provide a label at runtime
function hasLabel(wallet: unknown): wallet is Wallet & { label: string } {
  return (
    typeof wallet === 'object' &&
    wallet !== null &&
    'label' in wallet &&
    typeof (wallet as Record<string, unknown>)['label'] === 'string'
  );
}

export default function WalletStandardDebug() {
  const [debugLines, setDebugLines] = useState<string[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    const detectWallets = async () => {
      try {
        const walletsInterface = await getWallets();
        const walletsArray = [...walletsInterface.get()];

        // store wallets for detailed rendering
        setWallets(walletsArray);

        const output: string[] = [];

        walletsArray.forEach((wallet, i) => {
          const label = hasLabel(wallet) ? wallet.label : 'Unnamed Wallet';
          const chains = wallet.chains.join(', ');
          const features = Object.keys(wallet.features).join(', ');
          const accounts = wallet.accounts.length;

          output.push(`Wallet ${i + 1}: ${label}`);
          output.push(`🔗 Chains: ${chains}`);
          output.push(`👛 Accounts: ${accounts}`);
          output.push(`⚙️ Features: ${features}`);
        });

        if (output.length === 0) {
          output.push('⚠️ No wallets detected.');
        }

        setDebugLines(output);
      } catch (err) {
        setDebugLines([`❌ Wallet detection failed: ${String(err)}`]);
      }
    };

    detectWallets();
  }, []);

  return (
    <div className="p-4 text-sm text-white bg-black/20 rounded-xl mt-4">
      <h2 className="text-md font-semibold">Wallet Standard Debug</h2>

      {/* Summary Lines */}
      <ul className="mt-2 list-disc list-inside space-y-1">
        {debugLines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>

      {/* Detailed Wallet Breakdown */}
      <ul className="mt-2 list-disc list-inside space-y-2">
        {wallets.map((wallet, idx) => (
          <li key={idx} className="text-left">
            <div className="font-bold">Wallet {idx + 1}</div>
            <div>Chains: {wallet.chains.join(', ')}</div>
            <div>
              Accounts:
              {wallet.accounts.length === 0 ? (
                ' (none)'
              ) : (
                <ul className="ml-4 list-disc">
                  {wallet.accounts.map((acct, i) => (
                    <li key={i}>{acct.address}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              Features:
              <ul className="ml-4 list-disc">
                {Object.keys(wallet.features).map((feat, i) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}