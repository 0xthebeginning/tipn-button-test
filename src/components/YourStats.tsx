'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    farcaster?: {
      viewer?: {
        fid: number;
      };
    };
  }
}

export default function YourStats() {
  const [fid, setFid] = useState<number | null>(null);

  useEffect(() => {
    const viewer = window.farcaster?.viewer;
    if (viewer?.fid) {
      setFid(viewer.fid);
    } else {
      console.warn('No viewer or FID found on window.farcaster');
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow text-center">
      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Your Stats</h2>

      {fid !== null ? (
        <p className="text-sm text-green-600 dark:text-green-300 font-mono">
          Your FID: {fid}
        </p>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          FID not found
        </p>
      )}
    </div>
  );
}