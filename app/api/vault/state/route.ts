import { NextResponse } from 'next/server';
import { Store } from '@/lib/db/store';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const state = await Store.load();
    return NextResponse.json(state);
  } catch (error) {
    logger.error('Failed to get vault state:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get vault state',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}