import { NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics-engine';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    await trackEvent({
      ...body,
      ip,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
