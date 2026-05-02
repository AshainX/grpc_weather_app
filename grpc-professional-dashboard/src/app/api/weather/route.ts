import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const country = searchParams.get('country') || '';

  if (!city) {
    return NextResponse.json(
      { error: 'City is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/weather?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch weather' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to weather service' },
      { status: 500 }
    );
  }
}