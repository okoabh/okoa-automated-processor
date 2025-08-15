import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { BoxService } from '@/lib/integrations/box';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const dealId = formData.get('dealId') as string;
    const fileName = formData.get('fileName') as string || file.name;

    if (!file || !dealId) {
      return NextResponse.json(
        { error: 'File and dealId are required' },
        { status: 400 }
      );
    }

    console.log(`📤 Processing file upload: ${fileName} for deal: ${dealId}`);

    // Get deal information
    const deal = await convex.query(api.deals.getById, { dealId });
    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to Box.com
    let boxFileId = null;
    let boxUploadSuccess = false;
    
    try {
      const boxService = new BoxService();
      
      // Get the deal's Box folder ID from metadata
      const boxFolderId = deal.metadata?.boxFolderId || '0';
      
      // Upload file to Box
      const boxFile = await boxService.uploadFile(fileName, fileBuffer, boxFolderId);
      boxFileId = boxFile.id;
      boxUploadSuccess = true;
      
      console.log(`✅ File uploaded to Box.com: ${fileName} (ID: ${boxFileId})`);
      
    } catch (boxError) {
      console.error('❌ Box.com upload failed:', boxError);
      // Continue processing even if Box upload fails
    }

    // Create document record in Convex
    const documentId = await convex.mutation(api.documents.create, {
      dealId,
      fileName,
      fileSize: file.size,
      fileType: file.type || 'application/octet-stream',
      status: 'UPLOADED',
      uploadedAt: new Date().toISOString(),
      metadata: {
        boxFileId: boxFileId || undefined,
        boxUploadSuccess,
        originalName: file.name,
        uploadSource: 'web-interface'
      }
    });

    console.log(`📋 Document record created: ${documentId}`);

    // Queue for processing
    try {
      await convex.mutation(api.processing.queueDocument, {
        documentId,
        dealId,
        priority: 'NORMAL',
        processingType: 'FULL_ANALYSIS'
      });
      
      console.log(`🔄 Document queued for processing: ${documentId}`);
    } catch (queueError) {
      console.error('Failed to queue document for processing:', queueError);
    }

    // Send Slack notification
    try {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (slackWebhookUrl) {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `📄 New Document Uploaded: ${fileName}`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `📄 *New Document Uploaded*\n*Deal:* ${deal.name}\n*File:* ${fileName}\n*Size:* ${(file.size / 1024 / 1024).toFixed(2)} MB\n*Box Upload:* ${boxUploadSuccess ? '✅ Success' : '❌ Failed'}`
                }
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: '🔍 Review Document'
                    },
                    action_id: 'review_document',
                    value: documentId
                  },
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: '⚡ Priority Process'
                    },
                    style: 'primary',
                    action_id: 'priority_process',
                    value: documentId
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
      success: true,
      documentId,
      boxFileId,
      fileName,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Error uploading file:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}