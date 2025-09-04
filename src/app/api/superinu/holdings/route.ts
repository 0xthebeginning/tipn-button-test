// src/app/api/superinu/holdings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { erc20Abi } from "viem";

// SuperInu token
const TOKEN = (process.env.SUPERINU_TOKEN_ADDRESS ??
  "0x063eda1b84ceaf79b8cc4a41658b449e8e1f9eeb").toLowerCase();

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
            address: TOKEN as `0x${string}`,
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

    const holders = results.filter(r => r.ok).map(r => r.address);

    return NextResponse.json({
      token: TOKEN,
      holders,
      results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Internal error" },
      { status: 500 }
    );
  }
}