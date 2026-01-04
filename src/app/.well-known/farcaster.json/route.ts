export async function GET() {
  const r = await fetch(
    'https://api.farcaster.xyz/miniapps/hosted-manifest/01983f48-28c2-2dd3-8408-b7a5c9132f70',
    { cache: 'no-store' }
  );

  return new Response(await r.text(), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
