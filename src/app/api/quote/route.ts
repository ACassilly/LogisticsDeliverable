import { NextRequest, NextResponse } from 'next/server';

// Forward POST requests to the existing quote rate handler
export async function POST(request: NextRequest) {
  // Import and call the existing POST handler from /api/(public)/quote/rate
  const { POST: rateHandler } = await import('../(public)/quote/rate/route');
  return rateHandler(request);
}

// Return 405 Method Not Allowed for GET requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}