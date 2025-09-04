import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ReqBody = { addresses: string[] };

const STAKED_TOKEN =
  (process.env.SUPERINU_STAKED_TOKEN_ADDRESS ??
    "0xC7F2329977339F4Ae003373D1ACb9717F9d0c6D5").toLowerCase();

const ALCHEMY_RPC = process.env.ALCHEMY_BASE_RPC_URL;

const SELECTOR = "70a08231"; // balanceOf(address)

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
      return NextResponse.json({ token: STAKED_TOKEN, stakers: [], results: [] });
    }

    const batch = addresses.map((addr, i) => ({
      jsonrpc: "2.0",
      id: i + 1,
      method: "eth_call",
      params: [
        {
          to: STAKED_TOKEN,
          data: encodeBalanceOfData(addr),
        },
        "latest",
      ],
    }));

    const resp = await fetch(ALCHEMY_RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(batch),
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
      let balance = "0";
      try {
        balance = BigInt(hex).toString();
      } catch {
        balance = "0";
      }
      return { address: addr, ok: balance !== "0", balance };
    });

    const stakers = results.filter((r) => r.ok).map((r) => r.address);

    return NextResponse.json({
      token: STAKED_TOKEN,
      stakers,
      results,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Staked check failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}