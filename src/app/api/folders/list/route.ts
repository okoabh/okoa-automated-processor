import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'ACTIVE';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    console.log(`📋 Fetching folders with status: ${status}, limit: ${limit}`);

    const folders = await convex.query(api.folders.list, {
      status,
      limit
    });

    return NextResponse.json({
      success: true,
      folders,
      count: folders.length
    });

  } catch (error) {
    console.error('❌ Error fetching folders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch folders', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}