import { NextResponse } from 'next/server';

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
    const response = await fetch(
      `http://localhost:5000/api/forecast?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&days=${encodeURIComponent(days)}`,
      { cache: 'no-store' }
    );

    if (!response.ok || !response.body) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch forecast' },
        { status: response.status }
      );
    }

    // Return the SSE stream directly
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to connect to forecast service' },
      { status: 500 }
    );
  }
}