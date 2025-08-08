// src/app/api/superinu/staked/route.ts
import { NextRequest, NextResponse } from "next/server";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!;
const STAKED_TOKEN = "0xC7F2329977339F4Ae003373D1ACb9717F9d0c6D5"; // staked token (Base)

type ReqBody = { addresses: string[] };

type EtherscanTokenBalanceResp = {
  status?: string;
  message?: string;
  result?: string; // balance as decimal string (wei)
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReqBody;
    const addresses = Array.isArray(body.addresses) ? body.addresses : [];

    if (!ETHERSCAN_API_KEY) {
      return NextResponse.json(
        { error: "Missing ETHERSCAN_API_KEY" },
        { status: 500 }
      );
    }
    if (addresses.length === 0) {
      return NextResponse.json({ holders: [], results: [] });
    }

    const checks = await Promise.all(
      addresses.map(async (addr) => {
        const qs = new URLSearchParams({
          module: "account",
          action: "tokenbalance",
          contractaddress: STAKED_TOKEN,
          address: addr,
          tag: "latest",
          apikey: ETHERSCAN_API_KEY,
        });
        const url = `https://api.basescan.org/api?${qs.toString()}`;
        const r = await fetch(url);
        const j = (await r.json()) as EtherscanTokenBalanceResp;

        const ok = j.status === "1" && typeof j.result === "string";
        const balance = ok ? j.result! : "0";
        const has = ok && BigInt(balance) > 0n;

        return { address: addr, ok, balance, has };
      })
    );

    const stakers = checks.filter((x) => x.has).map((x) => x.address);
    return NextResponse.json({
      holders: stakers, // naming stays consistent with your existing code
      results: checks.map(({ address, ok, balance }) => ({ address, ok, balance })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Staked check failed" },
      { status: 500 }
    );
  }
}