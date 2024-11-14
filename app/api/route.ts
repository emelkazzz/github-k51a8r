import { NextResponse } from 'next/server';

// Fallback API route for static export
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}