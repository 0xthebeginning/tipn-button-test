// src/app/api/superinu/staked/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type StakedRequest = { addresses: string[] };

type EtherscanV2BalanceResp = {
  status?: string;
  message?: string;
  result?: string; // balance in wei (decimal string)
};

type AddressResult = {
  address: string;
  ok: boolean;
  balance: string; // wei string
  error?: string;
};

// Base staked/receipt token
const STAKED_TOKEN = (process.env.SUPERINU_STAKED_TOKEN_ADDRESS ?? "0xC7F2329977339F4Ae003373D1ACb9717F9d0c6D5").toLowerCase();

const API_KEY = process.env.ETHERSCAN_API_KEY;
const HOST = "https://api.etherscan.io/v2/api"; // Etherscan v2 aggregator
const BASE_CHAIN_ID = 8453;

// batching controls
const BATCH_SIZE = 4;      // up to 5 req/sec on free tier; keep a bit under
const PAUSE_MS = 1000;      // 1 second pause between batches
const RETRIES = 1;         // retry once on rate-limit or transient network

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchBalance(addr: string): Promise<AddressResult> {
  const qs = new URLSearchParams({
    chainid: String(BASE_CHAIN_ID),
    module: "account",
    action: "tokenbalance",
    contractaddress: STAKED_TOKEN,
    address: addr,
    tag: "latest",
    apikey: API_KEY as string,
  });
  const url = `${HOST}?${qs.toString()}`;

  let lastError: string | undefined;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) {
        lastError = `HTTP ${resp.status}`;
        // If rate-limited, wait a bit then retry
        if (resp.status === 429 && attempt < RETRIES) {
          await sleep(600);
          continue;
        }
        return { address: addr, ok: false, balance: "0", error: lastError };
      }

      const data = (await resp.json()) as EtherscanV2BalanceResp;

      const statusOk = data.status === "1";
      const hasResult = typeof data.result === "string";

      // Some rate-limit cases come back as status!="1" with a message
      if (!statusOk && !hasResult) {
        lastError = data.message ?? "Unknown error";
        // try once more if allowed
        if (/rate limit/i.test(lastError) && attempt < RETRIES) {
          await sleep(600);
          continue;
        }
        return { address: addr, ok: false, balance: "0", error: lastError };
      }

      const balance = data.result ?? "0";
      return { address: addr, ok: balance !== "0", balance };
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Network error";
      if (attempt < RETRIES) {
        await sleep(600);
        continue;
      }
      return { address: addr, ok: false, balance: "0", error: lastError };
    }
  }

  return { address: addr, ok: false, balance: "0", error: lastError ?? "Unknown error" };
}

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Missing ETHERSCAN_API_KEY env var" }, { status: 500 });
  }

  let body: StakedRequest;
  try {
    body = (await req.json()) as StakedRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = Array.isArray(body.addresses) ? body.addresses : [];
  const addresses = input
    .map((a) => (typeof a === "string" ? a.trim().toLowerCase() : ""))
    .filter((a) => /^0x[a-f0-9]{40}$/.test(a));

  if (addresses.length === 0) {
    return NextResponse.json({ error: "Provide addresses: string[]" }, { status: 400 });
  }

  const results: AddressResult[] = [];

  // process in batches to avoid rate limits
  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    const chunk = addresses.slice(i, i + BATCH_SIZE);
    const chunkResults = await Promise.all(chunk.map((addr) => fetchBalance(addr)));
    results.push(...chunkResults);

    if (i + BATCH_SIZE < addresses.length) {
      await sleep(PAUSE_MS);
    }
  }

  const holders = results.filter((r) => r.ok).map((r) => r.address);

  return NextResponse.json({
    token: STAKED_TOKEN,
    chainid: BASE_CHAIN_ID,
    holders,
    results,
  });
}