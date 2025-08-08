// src/components/YourStats.tsx
'use client';

import { useMiniApp } from '@neynar/react';

export default function YourStats() {
  const { context } = useMiniApp();
  const user = context?.user;
  const userFid = user?.fid;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow text-center">
      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Your Stats</h2>

      {typeof userFid === 'number' ? (
        <p className="text-sm text-green-600 dark:text-green-300 font-mono">
          Your FID: {userFid}
        </p>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          FID not available (open inside Farcaster miniapp)
        </p>
      )}
    </div>
  );
}