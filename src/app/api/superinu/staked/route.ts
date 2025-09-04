// src/app/api/superinu/staked/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { erc20Abi } from "viem";

const STAKED_TOKEN = (process.env.SUPERINU_STAKED_TOKEN_ADDRESS ??
  "0xC7F2329977339F4Ae003373D1ACb9717F9d0c6D5").toLowerCase();

const ALCHEMY_RPC = process.env.ALCHEMY_BASE_RPC_URL!;

export async function POST(req: NextRequest) {
  try {
    const { addresses } = (await req.json()) as { addresses: string[] };
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json({ error: "No addresses provided" }, { status: 400 });
    }

    const client = createPublicClient({
      chain: base,
      transport: http(ALCHEMY_RPC),
    });

    const results = await Promise.all(
      addresses.map(async (addr) => {
        try {
          const balance = await client.readContract({
            abi: erc20Abi,
            address: STAKED_TOKEN as `0x${string}`,
            functionName: "balanceOf",
            args: [addr as `0x${string}`],
          });

          const ok = (balance as bigint) > 0n;
          return { address: addr, ok, balance: balance.toString() };
        } catch (err) {
          return { address: addr, ok: false, balance: "0", error: (err as Error).message };
        }
      })
    );

    const stakers = results.filter(r => r.ok).map(r => r.address);

    return NextResponse.json({
      token: STAKED_TOKEN,
      stakers,
      results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Internal error" },
      { status: 500 }
    );
  }
}