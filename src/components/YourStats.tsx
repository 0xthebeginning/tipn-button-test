'use client';

import { useEffect, useState } from 'react';

const SUPERINU_TOKEN = '0x063eDA1b84ceaF79b8cC4a41658b449e8E1F9Eeb'; // Base chain
const BASE_RPC = 'https://mainnet.base.org'; // Or use Alchemy/Infura if rate limits become an issue

export default function YourStats() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isHolder, setIsHolder] = useState(false);
  const [isStaker, setIsStaker] = useState(false);

  useEffect(() => {
    async function checkWallets() {
      try {
        const viewerRes = await fetch('https://api.neynar.com/v2/farcaster/user/viewer', {
        headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '',
        },
        credentials: 'include',
        });

        const viewerData = await viewerRes.json();
        const fid = viewerData.user?.fid;

        if (!fid) return;

        const res = await fetch(
          `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
          {
            headers: {
              'api-key': process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '',
            },
          }
        );

        const data = await res.json();
        const user = data.users?.[0];
        const wallets: string[] = user?.verifications || [];

        if (!wallets.length) return;

        setWalletAddress(wallets[0]);

        // Check token balance for each wallet
        const checks = await Promise.all(
          wallets.map(async (addr) => {
            const body = {
              jsonrpc: '2.0',
              id: 1,
              method: 'eth_call',
              params: [
                {
                  to: SUPERINU_TOKEN,
                  data:
                    '0x70a08231000000000000000000000000' + addr.slice(2).toLowerCase(),
                },
                'latest',
              ],
            };

            const response = await fetch(BASE_RPC, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });

            const json = await response.json();
            const balanceHex = json.result;
            const balance = parseInt(balanceHex, 16);
            return balance > 0;
          })
        );

        const anyHold = checks.some((v) => v);
        setIsHolder(anyHold);
        setIsStaker(false); // Optional: implement real staking check

      } catch (err) {
        console.error('Failed to check holder status:', err);
      }
    }

    checkWallets();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow">
      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Your Stats</h2>

      {walletAddress ? (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
            Primary Wallet: <span className="font-mono">{walletAddress}</span>
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