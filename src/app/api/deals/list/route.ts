import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'ACTIVE';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    console.log(`📋 Fetching deals with status: ${status}, limit: ${limit}`);

    // Get deals from Convex
    const deals = await convex.query(api.deals.list, {
      status,
      limit
    });

    return NextResponse.json({
      success: true,
      deals,
      count: deals.length
    });

  } catch (error) {
    console.error('❌ Error fetching deals:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch deals', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}