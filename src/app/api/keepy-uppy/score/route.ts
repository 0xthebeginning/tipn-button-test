import { NextResponse } from 'next/server';
import { getKeepyUppyScore, submitKeepyUppyScore } from '~/lib/kv';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = Number(searchParams.get('fid'));

  if (!Number.isInteger(fid) || fid <= 0) {
    return NextResponse.json({ error: 'Invalid fid' }, { status: 400 });
  }

  try {
    const entry = await getKeepyUppyScore(fid);
    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Failed to fetch keepy-uppy score:', error);
    return NextResponse.json({ error: 'Failed to fetch score' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fid = Number(body.fid);
    const score = Number(body.score);

    if (!Number.isInteger(fid) || fid <= 0) {
      return NextResponse.json({ error: 'Invalid fid' }, { status: 400 });
    }

    if (!Number.isFinite(score) || score < 0) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    const entry = await submitKeepyUppyScore({
      fid,
      score,
      username: typeof body.username === 'string' ? body.username : undefined,
      displayName: typeof body.displayName === 'string' ? body.displayName : undefined,
      pfpUrl: typeof body.pfpUrl === 'string' ? body.pfpUrl : undefined,
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Failed to submit keepy-uppy score:', error);
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 });
  }
}
