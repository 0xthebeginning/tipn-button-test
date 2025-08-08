'use client';

import { useEffect, useState } from 'react';
import { useMiniApp } from '@neynar/react';

export default function YourStats() {
  const { context } = useMiniApp();
  const user = context?.user;
  const userFid = user?.fid;

  const [wallets, setWallets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchWallets() {
      if (!userFid) return;
      setLoading(true);

      try {
        const res = await fetch(
          `https://api.neynar.com/v2/farcaster/user/bulk?fids=${userFid}`,
          {
            headers: {
              'api-key': process.env.NEXT_PUBLIC_NEYNAR_API_KEY!,
            },
          }
        );

        const data = await res.json();
        const evmWallets: string[] =
          data?.users?.[0]?.verifications?.filter((addr: string) =>
            addr.startsWith('0x')
          ) || [];

        setWallets(evmWallets);
      } catch (err) {
        console.error('Failed to fetch wallets:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWallets();
  }, [userFid]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow text-center">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Your Stats
      </h2>

      {userFid ? (
        <>
          <p className="text-sm text-green-600 dark:text-green-300 font-mono mb-4">
            Your FID: {userFid}
          </p>

          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Connected EVM Wallets:
          </h3>

          {loading ? (
            <p className="text-sm text-gray-500">Loading wallets...</p>
          ) : wallets.length > 0 ? (
            <ul className="text-xs font-mono space-y-1">
              {wallets.map((wallet) => (
                <li key={wallet}>{wallet}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No wallets found</p>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">No user detected</p>
      )}
    </div>
  );
}