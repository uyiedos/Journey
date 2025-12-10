import { NextResponse } from 'next/server';

export async function POST() {
  // Basic implementation that returns a 501 Not Implemented response
  return NextResponse.json(
    { error: 'AI route not implemented yet' },
    { status: 501 }
  );
}
