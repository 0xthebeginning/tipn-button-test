// src/app/api/holdings/route.ts
import { NextRequest, NextResponse } from "next/server";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!;
const SUPERINU_CONTRACT = process.env.SUPERINU_CONTRACT!; // e.g. 0x063eDA1b84ceaF79b8cC4a41658b449e8E1F9Eeb
const CHAIN_ID = "8453"; // Base mainnet

type HoldingsReq = { addresses: string[] };
type EtherscanBalanceResp = { status?: string; result?: string; message?: string };

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    if (!ETHERSCAN_API_KEY || !SUPERINU_CONTRACT) {
      return NextResponse.json(
        { error: "Missing ETHERSCAN_API_KEY or SUPERINU_CONTRACT env." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as HoldingsReq;
    const addresses = Array.isArray(body.addresses) ? body.addresses : [];

    if (addresses.length === 0) {
      return NextResponse.json({ holders: [], results: [] });
    }

    const urlBase = "https://api.etherscan.io/v2/api";

    const checks = addresses.map(async (addr) => {
      const url = new URL(urlBase);
      url.searchParams.set("chainid", CHAIN_ID);
      url.searchParams.set("module", "account");
      url.searchParams.set("action", "tokenbalance");
      url.searchParams.set("contractaddress", SUPERINU_CONTRACT);
      url.searchParams.set("address", addr);
      url.searchParams.set("tag", "latest");
      url.searchParams.set("apikey", ETHERSCAN_API_KEY);

      const r = await fetch(url.toString(), { cache: "no-store" });
      if (!r.ok) {
        return { address: addr, ok: false as const, balance: "0" };
      }
      const j = (await r.json()) as EtherscanBalanceResp;
      const bal = j.result ?? "0";
      // Treat non-numeric as zero
      const safe = /^\d+$/.test(bal) ? bal : "0";
      return { address: addr, ok: true as const, balance: safe };
    });

    const results = await Promise.all(checks);
    const holders = results
      .filter((x) => x.ok && BigInt(x.balance) > 0n)
      .map((x) => x.address);

    return NextResponse.json({ holders, results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}