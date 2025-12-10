import { NextResponse } from 'next/server';

// Basic route handlers for /api/devotionals
export async function GET() {
  return NextResponse.json(
    { error: 'Not implemented' },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Not implemented' },
    { status: 501 }
  );
}
