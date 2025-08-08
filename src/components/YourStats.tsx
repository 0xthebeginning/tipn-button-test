'use client';

import { useEffect, useState } from 'react';
import { useMiniApp } from '@neynar/react';

export default function YourStats() {
  const { context } = useMiniApp();
  const userFid = context?.user?.fid ?? null;

  const [jsonOutput, setJsonOutput] = useState<string>('Loading…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userFid) return;

    (async () => {
      try {
        const res = await fetch(`https://api.neynar.com/v2/farcaster/user?fid=${userFid}`, {
          headers: {
            'api_key': process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '',
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        // Pretty-print JSON with indentation
        setJsonOutput(JSON.stringify(data, null, 2));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    })();
  }, [userFid]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow text-left">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Raw Neynar JSON</h2>

      {error ? (
        <p className="text-sm text-red-500">Error: {error}</p>
      ) : (
        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
          {jsonOutput}
        </pre>
      )}
    </div>
  );
}