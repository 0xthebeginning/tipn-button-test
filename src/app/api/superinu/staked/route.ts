// src/app/api/superinu/staked/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type ReqBody = { addresses: string[] };

type JsonRpcReq = {
  jsonrpc: "2.0";
  id: number;
  method: "alchemy_getTokenBalances";
  params: [string, { contractAddresses: string[] }];
};

type TokenBalance = { contractAddress: string; tokenBalance: string | null };
type JsonRpcRes =
  | { jsonrpc: "2.0"; id: number; result: { address: string; tokenBalances: TokenBalance[] } }
  | { jsonrpc: "2.0"; id: number; error: { code: number; message: string } };

type AddressResult = {
  address: string;
  ok: boolean;
  balanceHex: string; // hex string (wei)
  error?: string;
};

const ALCHEMY_BASE_RPC_URL = process.env.ALCHEMY_BASE_RPC_URL!;
const STAKED_TOKEN = (process.env.SUPERINU_STAKED_TOKEN_ADDRESS ?? "0xC7F2329977339F4Ae003373D1ACb9717F9d0c6D5").toLowerCase();

export async function POST(req: NextRequest) {
  if (!ALCHEMY_BASE_RPC_URL) {
    return NextResponse.json({ error: "Missing ALCHEMY_BASE_RPC_URL" }, { status: 500 });
  }

  let body: ReqBody;
  try {
    body = (await req.json()) as ReqBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = Array.isArray(body.addresses) ? body.addresses : [];
  const addresses = raw
    .map((a) => (typeof a === "string" ? a.trim().toLowerCase() : ""))
    .filter((a) => /^0x[a-f0-9]{40}$/.test(a));

  if (addresses.length === 0) {
    return NextResponse.json({ holders: [], results: [] });
  }

  const batch: JsonRpcReq[] = addresses.map((addr, i) => ({
    jsonrpc: "2.0",
    id: i + 1,
    method: "alchemy_getTokenBalances",
    params: [addr, { contractAddresses: [STAKED_TOKEN] }],
  }));

  const resp = await fetch(ALCHEMY_BASE_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(batch),
    cache: "no-store",
  });

  if (!resp.ok) {
    return NextResponse.json({ error: `RPC HTTP ${resp.status}` }, { status: 502 });
  }

  const data = (await resp.json()) as JsonRpcRes[];
  const byId = new Map<number, string>();
  addresses.forEach((addr, idx) => byId.set(idx + 1, addr));

  const results: AddressResult[] = data.map((item) => {
    const addr = byId.get("id" in item ? item.id : -1) ?? "0x";
    if ("error" in item) {
      return { address: addr, ok: false, balanceHex: "0x0", error: item.error.message };
    }
    const tb = item.result.tokenBalances?.[0];
    const hex = (tb?.tokenBalance ?? "0x0") || "0x0";
    let has = false;
    try {
      has = BigInt(hex) > 0n;
    } catch {
      // keep has=false
    }
    return { address: addr, ok: has, balanceHex: hex };
  });

  const holders = results.filter((r) => r.ok).map((r) => r.address);

  return NextResponse.json({
    token: STAKED_TOKEN,
    holders,
    results,
  });
}