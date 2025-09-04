import { NextRequest, NextResponse } from "next/server";

// Use Node runtime for better compatibility
export const runtime = "nodejs";

type ReqBody = { addresses: string[] };

const TOKEN =
  (process.env.SUPERINU_TOKEN_ADDRESS ??
    "0x063eDA1b84ceaF79b8cC4a41658b449e8e1f9eeb").toLowerCase();

const ALCHEMY_RPC = process.env.ALCHEMY_BASE_RPC_URL;

// 4-byte selector of balanceOf(address): keccak256("balanceOf(address)") -> 0x70a08231
const SELECTOR = "70a08231";

function pad32(hexNo0x: string) {
  return hexNo0x.padStart(64, "0");
}

function encodeBalanceOfData(address: string) {
  const addr = address.toLowerCase().replace(/^0x/, "");
  return "0x" + SELECTOR + pad32(addr);
}

export async function POST(req: NextRequest) {
  try {
    if (!ALCHEMY_RPC) {
      return NextResponse.json(
        { error: "Missing ALCHEMY_BASE_RPC_URL env var" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as ReqBody;
    const input = Array.isArray(body.addresses) ? body.addresses : [];
    const addresses = input
      .map((a) => (typeof a === "string" ? a.trim().toLowerCase() : ""))
      .filter((a) => /^0x[a-f0-9]{40}$/.test(a));

    if (addresses.length === 0) {
      return NextResponse.json({ token: TOKEN, holders: [], results: [] });
    }

    // Build JSON-RPC batch
    const batch = addresses.map((addr, i) => ({
      jsonrpc: "2.0",
      id: i + 1,
      method: "eth_call",
      params: [
        {
          to: TOKEN,
          data: encodeBalanceOfData(addr),
        },
        "latest",
      ],
    }));

    const resp = await fetch(ALCHEMY_RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(batch),
      // Don’t let the platform cache RPC responses
      cache: "no-store",
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Alchemy RPC HTTP ${resp.status}` },
        { status: 502 }
      );
    }

    type RpcItem = { id: number; result?: string; error?: { code: number; message: string } };
    const json = (await resp.json()) as RpcItem[];

    const results = addresses.map((addr, idx) => {
      const item = json.find((j) => j.id === idx + 1);
      if (!item) return { address: addr, ok: false, balance: "0", error: "missing response" };

      if (item.error) {
        return {
          address: addr,
          ok: false,
          balance: "0",
          error: item.error.message ?? `rpc error ${item.error.code}`,
        };
      }

      const hex = (item.result ?? "0x0").toString();
      // hex -> bigint -> string
      let balance = "0";
      try {
        balance = BigInt(hex).toString();
      } catch {
        balance = "0";
      }
      return { address: addr, ok: balance !== "0", balance };
    });

    const holders = results.filter((r) => r.ok).map((r) => r.address);

    return NextResponse.json({
      token: TOKEN,
      holders,
      results,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Holdings check failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}