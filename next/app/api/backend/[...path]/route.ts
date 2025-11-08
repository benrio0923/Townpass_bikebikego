import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8001';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const path = resolvedParams.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/api/v1/${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`[API GET] Proxying to: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API GET] Error:', error);
    return NextResponse.json(
      { error: 'Backend API request failed' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const path = resolvedParams.path.join('/');
    const url = `${BACKEND_URL}/api/v1/${path}`;
    
    const body = await request.json();
    
    console.log(`[API POST] Proxying to: ${url}`);
    console.log(`[API POST] Body:`, body);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();
    console.log(`[API POST] Response:`, data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API POST] Error:', error);
    return NextResponse.json(
      { error: 'Backend API request failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const path = resolvedParams.path.join('/');
    const url = `${BACKEND_URL}/api/v1/${path}`;
    
    const body = await request.json();

    console.log(`[API PUT] Proxying to: ${url}`);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API PUT] Error:', error);
    return NextResponse.json(
      { error: 'Backend API request failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const path = resolvedParams.path.join('/');
    const url = `${BACKEND_URL}/api/v1/${path}`;

    console.log(`[API DELETE] Proxying to: ${url}`);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Backend API request failed' },
      { status: 500 }
    );
  }
}

// Export runtime configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
