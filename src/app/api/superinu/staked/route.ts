import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

export const runtime = "nodejs";

type ReqBody = { addresses: string[] };

const STAKED_TOKEN =
  (process.env.SUPERINU_STAKED_TOKEN_ADDRESS ??
    "0xC7F2329977339F4Ae003373D1ACb9717F9d0c6D5").toLowerCase();

const ALCHEMY_BASE_RPC_URL = process.env.ALCHEMY_BASE_RPC_URL;

const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export async function POST(req: NextRequest) {
  try {
    if (!ALCHEMY_BASE_RPC_URL) {
      return NextResponse.json(
        { error: "Missing ALCHEMY_BASE_RPC_URL" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as ReqBody;
    const input = Array.isArray(body.addresses) ? body.addresses : [];

    const addresses = input
      .map((a) => (typeof a === "string" ? a.trim().toLowerCase() : ""))
      .filter((a) => /^0x[a-f0-9]{40}$/.test(a));

    if (addresses.length === 0) {
      return NextResponse.json({ token: STAKED_TOKEN, stakers: [], results: [] });
    }

    const client = createPublicClient({
      chain: base,
      transport: http(ALCHEMY_BASE_RPC_URL),
    });

    const contracts = addresses.map((addr) => ({
      address: STAKED_TOKEN as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [addr as `0x${string}`],
    }));

    const resp = await client.multicall({
      allowFailure: true,
      contracts,
    });

    const results = resp.map((entry, i) => {
      const address = addresses[i];
      if (entry.status === "failure") {
        return {
          address,
          ok: false,
          balance: "0",
          error: entry.error?.message ?? "multicall failure",
        };
      }
      const bal = (entry.result as bigint) ?? 0n;
      return {
        address,
        ok: bal > 0n,
        balance: bal.toString(),
      };
    });

    const stakers = results.filter((r) => r.ok).map((r) => r.address);

    return NextResponse.json({ token: STAKED_TOKEN, stakers, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Staked check failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}