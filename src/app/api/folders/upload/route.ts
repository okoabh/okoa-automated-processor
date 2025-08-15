import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { BoxService } from '@/lib/integrations/box';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string;

    if (!file || !folderId) {
      return NextResponse.json(
        { error: 'File and folderId are required' },
        { status: 400 }
      );
    }

    console.log(`📤 Processing file upload: ${file.name} to folder: ${folderId}`);

    // Get folder information
    const folder = await convex.query(api.folders.get, { folderId });
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to Box.com
    let boxFileId = null;
    try {
      const boxService = new BoxService();
      const boxFolderId = folder.boxFolderId || '0';
      
      const boxFile = await boxService.uploadFile(file.name, fileBuffer, boxFolderId);
      boxFileId = boxFile.id;
      
      console.log(`✅ File uploaded to Box.com: ${file.name} (ID: ${boxFileId})`);
      
    } catch (boxError) {
      console.error('❌ Box.com upload failed:', boxError);
    }

    // Create document record
    const documentId = await convex.mutation(api.documents.create, {
      folderId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'application/octet-stream',
      status: 'UPLOADED',
      uploadedAt: new Date().toISOString(),
      boxFileId: boxFileId || undefined,
      metadata: {
        uploadSource: 'web-interface',
        originalName: file.name
      }
    });

    console.log(`📋 Document record created: ${documentId}`);

    // Queue for processing
    await convex.mutation(api.processing.queueDocument, {
      documentId,
      priority: 'NORMAL',
      processingType: 'AUTO_ANALYSIS'
    });

    // Update folder document count
    await convex.mutation(api.folders.updateDocumentCount, {
      folderId,
      change: 1
    });

    console.log(`🔄 Document queued for processing: ${documentId}`);

    // Send Slack notification
    try {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (slackWebhookUrl) {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `📄 Document Uploaded: ${file.name}`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `📄 *Document Uploaded*\n*Folder:* ${folder.name}\n*File:* ${file.name}\n*Size:* ${(file.size / 1024 / 1024).toFixed(2)} MB\n⚡ *Processing started automatically*`
                }
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
      fileName: file.name
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