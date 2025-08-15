import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { BoxClient } from '../../../../lib/box/client';
import { SlackNotifier } from '../../../../lib/notifications/slack';
import type { BoxWebhookEvent } from '../../../../types';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const slackNotifier = new SlackNotifier();

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-box-signature');
    
    // Verify webhook signature
    if (!BoxClient.verifyWebhookSignature(body, signature || '')) {
      console.error('Invalid Box webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Parse webhook payload
    const event: BoxWebhookEvent = JSON.parse(body);
    
    console.log('Box webhook received:', {
      trigger: event.trigger,
      fileName: event.source.name,
      fileId: event.source.id,
      eventId: event.event_id
    });
    
    // Only process file upload events
    if (event.trigger !== 'FILE.UPLOADED') {
      console.log(`Ignoring webhook event: ${event.trigger}`);
      return NextResponse.json({ message: 'Event ignored' });
    }
    
    // Check if we already processed this file
    const existingDoc = await convex.query('documents:getByBoxFileId', {
      boxFileId: event.source.id
    });
    
    if (existingDoc) {
      console.log(`File already processed: ${event.source.name}`);
      return NextResponse.json({ message: 'File already processed' });
    }
    
    // Create document record in database
    const documentId = await convex.mutation('documents:create', {
      filename: generateSafeFilename(event.source.name),
      originalFilename: event.source.name,
      filePath: '', // Will be populated during processing
      boxFileId: event.source.id,
      fileSize: 0, // Will be updated when we download the file
      metadata: {
        boxEvent: {
          eventId: event.event_id,
          createdAt: event.created_at,
          parentFolder: event.source.parent?.name || 'Unknown'
        }
      }
    });
    
    console.log(`Document created: ${documentId} for file ${event.source.name}`);
    
    // Queue document for processing
    const jobId = await convex.mutation('processingJobs:create', {
      documentId,
      jobType: 'document_analysis',
      priority: 5, // Normal priority
      llmProvider: 'anthropic',
      llmModel: process.env.DEFAULT_CLAUDE_MODEL || 'claude-3-5-sonnet-20250113',
    });
    
    console.log(`Processing job created: ${jobId}`);
    
    // Send Slack notification
    await slackNotifier.sendNotification({
      type: 'PROCESSING_STARTED',
      title: '📁 New Document Uploaded',
      message: `File "${event.source.name}" has been uploaded and queued for processing`,
      timestamp: Date.now(),
      data: {
        filename: event.source.name,
        documentId,
        jobId,
        autoTriggered: true,
        documentCount: 1,
        activeAgents: 0, // Will be updated by agent pool
        estimatedCost: 1.50, // Rough estimate
        estimatedDuration: '~5 min'
      },
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
    });
    
    // Trigger immediate processing (don't wait for queue processor)
    await triggerImmediateProcessing(documentId, jobId);
    
    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      documentId,
      jobId 
    });
    
  } catch (error) {
    console.error('Box webhook processing failed:', error);
    
    // Send error notification to Slack
    await slackNotifier.sendNotification({
      type: 'PROCESSING_FAILED',
      title: '❌ Webhook Processing Failed',
      message: `Failed to process Box.com webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now(),
      data: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle Box webhook validation (GET request)
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('challenge');
  
  if (challenge) {
    console.log('Box webhook validation challenge received');
    return new Response(challenge, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
  
  return NextResponse.json({ message: 'Box webhook endpoint is active' });
}

// Trigger immediate processing without waiting for queue
async function triggerImmediateProcessing(documentId: string, jobId: string) {
  try {
    // This would normally be handled by a background queue processor
    // For now, we'll trigger it via API call
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/processing/process-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}` // Internal API auth
      },
      body: JSON.stringify({
        documentId,
        jobId,
        priority: 'HIGH' // Process immediately
      })
    });
    
    if (!response.ok) {
      console.error('Failed to trigger immediate processing:', response.statusText);
    } else {
      console.log('Immediate processing triggered successfully');
    }
  } catch (error) {
    console.error('Error triggering immediate processing:', error);
    // Don't fail the webhook - processing will be picked up by queue eventually
  }
}

// Generate safe filename for database storage
function generateSafeFilename(originalName: string): string {
  return originalName
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')  // Replace special chars with underscore
    .replace(/_{2,}/g, '_')              // Replace multiple underscores with single
    .toLowerCase();
}

// Validate file type for processing
function isProcessableFileType(filename: string): boolean {
  const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.pptx', '.txt', '.jpg', '.jpeg', '.png'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExtensions.includes(extension);
}