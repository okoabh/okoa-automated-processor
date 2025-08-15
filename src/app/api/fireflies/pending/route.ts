import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    // Get all pending Fireflies processing requests
    const pendingRequests = await convex.query(api.fireflies.listPending);
    return NextResponse.json({ requests: pendingRequests });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return NextResponse.json({ error: 'Failed to fetch pending requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { transcriptId, action, dealId } = await request.json();
    
    if (action === 'approve') {
      // Process the transcript with the specified deal ID
      await convex.mutation(api.fireflies.processTranscript, {
        transcriptId,
        dealId: dealId || null,
        approved: true
      });
      
      return NextResponse.json({ status: 'approved', transcriptId });
    } else if (action === 'reject') {
      // Mark as rejected
      await convex.mutation(api.fireflies.rejectTranscript, { transcriptId });
      return NextResponse.json({ status: 'rejected', transcriptId });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
  }
}