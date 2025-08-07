'use client';

import { useEffect, useState } from 'react';

interface NeynarUserResponse {
  user: {
    fid: number;
  };
}

export default function YourStats() {
  const [fid, setFid] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFid() {
      try {
        const res = await fetch('https://api.neynar.com/v2/farcaster/user', {
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.NEXT_PUBLIC_NEYNAR_API_KEY!,
          },
          credentials: 'include',
        });

        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

        const data: NeynarUserResponse = await res.json();
        const fetchedFid = data?.user?.fid;

        if (fetchedFid) {
          setFid(fetchedFid);
        } else {
          setError('FID not found in response');
        }
      } catch (err: unknown) {
        console.error('Failed to fetch FID from Neynar:', err);
        setError('Error fetching FID');
      }
    }

    fetchFid();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow text-center">
      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Your Stats</h2>

      {fid !== null ? (
        <p className="text-sm text-green-600 dark:text-green-300 font-mono">
          Your FID: {fid}
        </p>
      ) : error ? (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      )}
    </div>
  );
}