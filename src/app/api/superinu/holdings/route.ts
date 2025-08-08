// src/app/api/superinu/holdings/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface HoldingsRequest {
  addresses: string[];
}

interface EtherscanV2BalanceResp {
  status?: string;
  message?: string;
  result?: string; // balance in wei as decimal string
}

interface AddressResult {
  address: string;
  ok: boolean;
  balance: string; // wei string
  error?: string;
}

const TOKEN = (process.env.SUPERINU_TOKEN_ADDRESS ?? "0x063eda1b84ceaf79b8cc4a41658b449e8e1f9eeb").toLowerCase();
const API_KEY = process.env.ETHERSCAN_API_KEY;
const HOST = "https://api.etherscan.io/v2/api"; // Etherscan v2 aggregator
const BASE_CHAIN_ID = 8453;

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing ETHERSCAN_API_KEY env var" },
      { status: 500 }
    );
  }

  let body: HoldingsRequest;
  try {
    body = (await req.json()) as HoldingsRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const input = Array.isArray(body.addresses) ? body.addresses : [];
  const addresses = input
    .map((a) => (typeof a === "string" ? a.trim().toLowerCase() : ""))
    .filter((a) => /^0x[a-f0-9]{40}$/.test(a));

  if (addresses.length === 0) {
    return NextResponse.json(
      { error: "Provide addresses: string[]" },
      { status: 400 }
    );
  }

  const results = await Promise.allSettled(
    addresses.map(async (addr): Promise<AddressResult> => {
      const url =
        `${HOST}?chainid=${BASE_CHAIN_ID}` +
        `&module=account&action=tokenbalance` +
        `&contractaddress=${TOKEN}` +
        `&address=${addr}` +
        `&tag=latest` +
        `&apikey=${API_KEY}`;

      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) {
        return {
          address: addr,
          ok: false,
          balance: "0",
          error: `HTTP ${resp.status}`,
        };
      }

      const data = (await resp.json()) as EtherscanV2BalanceResp;

      const hasStatusOk = data.status === "1";
      const hasResult = typeof data.result === "string";

      if (!hasStatusOk && !hasResult) {
        return {
          address: addr,
          ok: false,
          balance: "0",
          error: data.message ?? "Unknown error",
        };
      }

      const balance = data.result ?? "0";
      const ok = balance !== "0";

      return { address: addr, ok, balance };
    })
  );

  const parsed: AddressResult[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      address: addresses[i],
      ok: false,
      balance: "0",
      error: r.reason instanceof Error ? r.reason.message : "Request failed",
    };
  });

  const holders = parsed.filter((p) => p.ok).map((p) => p.address);

  return NextResponse.json({
    token: TOKEN,
    chainid: BASE_CHAIN_ID,
    holders,
    results: parsed,
  });
}