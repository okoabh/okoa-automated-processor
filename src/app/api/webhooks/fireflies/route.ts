import { NextRequest, NextResponse } from 'next/server';
import { FirefliesClient } from '@/lib/integrations/fireflies';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Fireflies webhook received');

    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256') || request.headers.get('x-hub-signature');
    
    if (!signature) {
      console.error('❌ Missing webhook signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify webhook signature for security
    const webhookSecret = process.env.FIREFLIES_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ FIREFLIES_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const isValidSignature = FirefliesClient.verifyWebhookSignature(body, signature, webhookSecret);
    if (!isValidSignature) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    console.log('📋 Webhook payload:', payload);

    const webhookData = FirefliesClient.processWebhookPayload(payload);
    
    // Only process transcript creation/update events
    if (!['transcript.created', 'transcript.updated'].includes(webhookData.eventType)) {
      console.log(`ℹ️ Ignoring webhook event: ${webhookData.eventType}`);
      return NextResponse.json({ status: 'ignored', event: webhookData.eventType });
    }

    // Initialize Fireflies client
    const firefliesClient = new FirefliesClient(process.env.FIREFLIES_API_KEY!);
    
    // Fetch the full transcript details
    const transcript = await firefliesClient.getTranscript(webhookData.transcriptId);
    if (!transcript) {
      console.error('❌ Failed to fetch transcript details');
      return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 404 });
    }

    console.log('📝 Creating pending approval request for transcript:', transcript.title);

    // Instead of auto-processing, create a pending approval request
    const pendingId = await convex.mutation(api.fireflies.createPendingRequest, {
      transcriptId: transcript.id,
      title: transcript.title,
      date: transcript.date,
      duration: transcript.duration,
      participants: transcript.participants,
      summary: transcript.summary || undefined,
      meetingUrl: transcript.meeting_url || undefined,
      rawTranscriptData: transcript,
    });

    console.log('✅ Created pending approval request:', pendingId);

    // Send interactive Slack notification for approval
    try {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (slackWebhookUrl) {
        // Get list of active deals for the dropdown
        const deals = await convex.query(api.deals.list, { status: 'ACTIVE', limit: 20 });
        
        const dealOptions = deals.map(deal => ({
          text: {
            type: 'plain_text',
            text: deal.name
          },
          value: deal._id
        }));

        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🔔 New Meeting Transcript Needs Approval`,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: '🔔 Meeting Transcript Ready for Review'
                }
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*Meeting:* ${transcript.title}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Date:* ${new Date(transcript.date).toLocaleDateString()}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Duration:* ${Math.round(transcript.duration / 60)} minutes`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Participants:* ${transcript.participants.length}`
                  }
                ]
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Summary:*\n${transcript.summary ? transcript.summary.substring(0, 200) + '...' : 'No summary available'}`
                }
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Participants:*\n${transcript.participants.slice(0, 5).map(p => `• ${p.name}`).join('\n')}`
                }
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: '*Choose how to process this transcript:*'
                }
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: '✅ Approve & File to Wolfgramm Ascent Waldorf'
                    },
                    style: 'primary',
                    action_id: 'approve_transcript',
                    value: transcript.id,
                    confirm: {
                      title: {
                        type: 'plain_text',
                        text: 'File to Wolfgramm Ascent Waldorf?'
                      },
                      text: {
                        type: 'mrkdwn',
                        text: `Are you sure you want to file "${transcript.title}" to the Wolfgramm Ascent Waldorf deal folder?`
                      },
                      confirm: {
                        type: 'plain_text',
                        text: 'Yes, File It'
                      },
                      deny: {
                        type: 'plain_text',
                        text: 'Cancel'
                      }
                    }
                  },
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: '📁 Approve & File to General'
                    },
                    style: 'primary',
                    action_id: 'approve_transcript',
                    value: transcript.id
                  }
                ]
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: '👁️ View Full Transcript'
                    },
                    action_id: 'view_transcript',
                    value: transcript.id
                  },
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: '❌ Reject'
                    },
                    style: 'danger',
                    action_id: 'reject_transcript',
                    value: transcript.id,
                    confirm: {
                      title: {
                        type: 'plain_text',
                        text: 'Reject Transcript?'
                      },
                      text: {
                        type: 'mrkdwn',
                        text: `Are you sure you want to reject "${transcript.title}"? This will remove it from the processing queue.`
                      },
                      confirm: {
                        type: 'plain_text',
                        text: 'Yes, Reject It'
                      },
                      deny: {
                        type: 'plain_text',
                        text: 'Cancel'
                      }
                    }
                  }
                ]
              }
            ]
          })
        });
      }
    } catch (slackError) {
      console.error('Failed to send Slack notification:', slackError);
    }

    return NextResponse.json({
      status: 'success',
      transcriptId: transcript.id,
      title: transcript.title,
      dealId,
      filesCreated: [filename, synthFilename]
    });

  } catch (error) {
    console.error('❌ Error processing Fireflies webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Attempt to determine which deal a transcript belongs to
 * This is a simple implementation - you might want to enhance this with more sophisticated matching
 */
async function determineDealFromTranscript(transcript: any): Promise<string | null> {
  try {
    // Get all active deals
    const deals = await convex.query(api.deals.list, { status: 'ACTIVE', limit: 100 });
    
    // Simple matching logic - look for deal name in transcript title
    for (const deal of deals) {
      const dealNameLower = deal.name.toLowerCase();
      const titleLower = transcript.title.toLowerCase();
      
      // Check if deal name appears in transcript title
      if (titleLower.includes(dealNameLower)) {
        return deal._id;
      }
    }
    
    // Could also check participant emails against deal metadata if available
    // or use other heuristics to match transcripts to deals
    
    return null;
  } catch (error) {
    console.error('Error determining deal from transcript:', error);
    return null;
  }
}

/**
 * Update the synth-comms-master file for a deal with new transcript summary
 */
async function updateSynthCommsMasterFile(dealId: string, transcript: any, synthSummary: string) {
  try {
    // This would typically involve:
    // 1. Checking if a synth-comms-master file exists for the deal
    // 2. If not, creating one
    // 3. Appending the new summary to the master file
    // 4. Updating the document in both Convex and Box.com
    
    console.log(`📝 Updating synth-comms-master file for deal: ${dealId}`);
    
    // Implementation would go here - for now just log the action
    // This would involve Box.com integration to update the actual file
    
  } catch (error) {
    console.error('Error updating synth-comms-master file:', error);
  }
}