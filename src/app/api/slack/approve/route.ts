import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const payload = new URLSearchParams(body);
    const slackPayload = JSON.parse(payload.get('payload') || '{}');

    console.log('🔔 Slack interactive action received:', slackPayload.type);

    // Verify this is from Slack (optional but recommended)
    if (slackPayload.token !== process.env.SLACK_VERIFICATION_TOKEN && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 401 });
    }

    // Handle button clicks
    if (slackPayload.type === 'interactive_message' || slackPayload.type === 'block_actions') {
      const action = slackPayload.actions[0];
      const transcriptId = action.value;
      const actionType = action.action_id;

      console.log(`📋 Processing action: ${actionType} for transcript: ${transcriptId}`);

      if (actionType === 'approve_transcript') {
        // Get the selected deal from the action (if provided)
        const dealId = action.selected_option?.value || null;
        
        // Process the transcript approval
        const result = await convex.mutation(api.fireflies.processTranscript, {
          transcriptId,
          dealId,
          approved: true
        });

        console.log('✅ Transcript approved:', result);

        // Send success response back to Slack
        return NextResponse.json({
          text: `✅ Transcript approved and processing started!`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `✅ *Transcript Approved*\n📝 Processing transcript: ${transcriptId}\n📁 ${dealId ? `Filed to deal: ${dealId}` : 'Filed to general folder'}\n⚡ Documents will be available in ~2 minutes`
              }
            }
          ]
        });

      } else if (actionType === 'reject_transcript') {
        // Reject the transcript
        await convex.mutation(api.fireflies.rejectTranscript, {
          transcriptId
        });

        console.log('❌ Transcript rejected:', transcriptId);

        return NextResponse.json({
          text: `❌ Transcript rejected and removed from queue.`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `❌ *Transcript Rejected*\n📝 Transcript ${transcriptId} has been rejected and removed from the processing queue.`
              }
            }
          ]
        });

      } else if (actionType === 'review_document') {
        // Review document action - get document details
        const documentId = action.value;
        const document = await convex.query(api.documents.get, { documentId });

        if (document) {
          return NextResponse.json({
            text: `📄 Document Details`,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: `📄 ${document.fileName}`
                }
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*Size:* ${(document.fileSize / 1024 / 1024).toFixed(2)} MB`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Type:* ${document.fileType || 'Unknown'}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Status:* ${document.status}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Uploaded:* ${document.uploadedAt ? new Date(document.uploadedAt).toLocaleString() : 'Unknown'}`
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
                      text: '⚡ Start Processing'
                    },
                    style: 'primary',
                    action_id: 'start_processing',
                    value: documentId
                  },
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: '📁 View in Box'
                    },
                    action_id: 'view_in_box',
                    value: document.boxFileId || documentId,
                    url: document.boxFileId ? `https://app.box.com/file/${document.boxFileId}` : undefined
                  }
                ]
              }
            ]
          });
        }

      } else if (actionType === 'priority_process') {
        // Priority process document
        const documentId = action.value;
        
        // Queue document for high priority processing
        await convex.mutation(api.processing.queueDocument, {
          documentId,
          priority: 'HIGH',
          processingType: 'PRIORITY_ANALYSIS'
        });

        return NextResponse.json({
          text: `⚡ Document queued for priority processing!`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `⚡ *Priority Processing Started*\n📄 Document ${documentId} has been queued for high-priority processing.\n⏱️ Estimated completion: <5 minutes`
              }
            }
          ]
        });

      } else if (actionType === 'start_processing') {
        // Start processing document
        const documentId = action.value;
        
        await convex.mutation(api.processing.queueDocument, {
          documentId,
          priority: 'NORMAL',
          processingType: 'FULL_ANALYSIS'
        });

        return NextResponse.json({
          text: `🔄 Document processing started!`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🔄 *Processing Started*\n📄 Document ${documentId} has been queued for processing.\n⏱️ Estimated completion: <10 minutes`
              }
            }
          ]
        });

      } else if (actionType === 'view_transcript') {
        // Get transcript details for preview
        const pendingRequest = await convex.query(api.fireflies.listPending);
        const transcript = pendingRequest.find(req => req.transcriptId === transcriptId);

        if (transcript) {
          return NextResponse.json({
            text: `📋 Transcript Details`,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: `📋 ${transcript.title}`
                }
              },
              {
                type: 'section',
                fields: [
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
                  text: `*Summary:*\n${transcript.summary || 'No summary available'}`
                }
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Participants:*\n${transcript.participants.map(p => `• ${p.name}${p.email ? ` (${p.email})` : ''}`).join('\n')}`
                }
              }
            ]
          });
        }
      }
    }

    return NextResponse.json({ text: 'Action processed successfully' });

  } catch (error) {
    console.error('❌ Error processing Slack action:', error);
    return NextResponse.json(
      { error: 'Failed to process action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}