import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const country = searchParams.get('country') || '';
  const days = searchParams.get('days') || '5';

  if (!city) {
    return NextResponse.json(
      { error: 'City is required' },
      { status: 400 }
    );
  }

  try {
    const encoder = new TextEncoder();
    const flaskUrl = `${BACKEND_URL}/api/forecast?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&days=${encodeURIComponent(days)}`;
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(flaskUrl, { cache: 'no-store' });
          
          if (!response.ok) {
            const errorText = await response.text();
            controller.enqueue(encoder.encode(`event: error\ndata: ${errorText}\n\n`));
            controller.close();
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } finally {
            reader.releaseLock();
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          controller.enqueue(encoder.encode(`event: error\ndata: {"error": "${errorMsg}"}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to forecast service' },
      { status: 500 }
    );
  }
}