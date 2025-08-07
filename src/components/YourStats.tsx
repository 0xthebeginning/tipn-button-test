'use client';

import { useEffect, useState } from 'react';

export default function YourStats() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isHolder, setIsHolder] = useState(false);
  const [isStaker, setIsStaker] = useState(false);

  useEffect(() => {
    // Example placeholder
    async function checkWalletStatus() {
      try {
        const connected = window.farcaster?.wallet;
        if (connected?.address) {
          setWalletAddress(connected.address);

          // TODO: Replace with real checks
          setIsHolder(true); // fake condition
          setIsStaker(false); // fake condition
        }
      } catch (err) {
        console.error('Failed to fetch wallet info:', err);
      }
    }

    checkWalletStatus();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow">
      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Your Stats</h2>

      {walletAddress ? (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
            Address: <span className="font-mono">{walletAddress}</span>
          </p>
          <p className="mt-2 text-sm">
            ✅ Holder: {isHolder ? 'Yes' : 'No'}
          </p>
          <p className="text-sm">
            🔒 Staker: {isStaker ? 'Yes' : 'No'}
          </p>
        </>
      ) : (
        <p className="text-sm text-gray-500">No wallet connected yet.</p>
      )}
    </div>
  );
}