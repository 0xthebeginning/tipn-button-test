'use client';

import { useEffect, useState } from 'react';

const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY!;

export default function YourStats() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [wallets, setWallets] = useState<string[]>([]);
  const [isHolder, setIsHolder] = useState(false);
  const [isStaker, setIsStaker] = useState(false);

  useEffect(() => {
    async function fetchViewerAndWallets() {
      try {
        // Step 1: get viewer (currently logged in user)
        const viewerRes = await fetch(`https://api.neynar.com/v2/farcaster/user`, {
          headers: { 'api-key': NEYNAR_API_KEY },
        });

        const viewer = await viewerRes.json();
        const fid = viewer.result?.user?.fid;

        if (!fid) {
          console.warn('No FID returned from viewer endpoint');
          return;
        }

        // Step 2: get wallet info
        const userRes = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
          headers: { 'api-key': NEYNAR_API_KEY },
        });

        const userData = await userRes.json();
        const user = userData.users?.[0];
        const verifiedWallets = user?.verifications || [];

        if (verifiedWallets.length > 0) {
          setWallets(verifiedWallets);
          setWalletAddress(verifiedWallets[0]);

          // ✅ Replace this with real SuperInu holders check
          const isTestHolder = verifiedWallets.some(addr =>
            addr.toLowerCase() === '0xYourTestHolderAddress'.toLowerCase()
          );

          setIsHolder(isTestHolder);
        }
      } catch (err) {
        console.error('Error fetching wallets:', err);
      }
    }

    fetchViewerAndWallets();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow">
      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Your Stats</h2>

      {walletAddress ? (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
            Primary Wallet: <span className="font-mono">{walletAddress}</span>
          </p>
          <p className="mt-2 text-sm">✅ Holder: {isHolder ? 'Yes' : 'No'}</p>
          <p className="text-sm">🔒 Staker: {isStaker ? 'Yes' : 'No'}</p>
        </>
      ) : (
        <p className="text-sm text-gray-500">No wallet connected yet.</p>
      )}
    </div>
  );
}