import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { BoxService } from '@/lib/integrations/box';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      description,
      dealType,
      priority = 'MEDIUM',
      expectedCloseDate,
      dealSize,
      notes
    } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    console.log('🏗️ Creating new deal:', name);

    // Create deal in Convex database
    const dealId = await convex.mutation(api.deals.create, {
      name,
      description,
      dealType,
      status: 'ACTIVE',
      priority,
      expectedCloseDate: expectedCloseDate || undefined,
      metadata: {
        dealSize: dealSize || undefined,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
        phase: 'Setup'
      }
    });

    console.log('✅ Deal created in database:', dealId);

    // Create Box.com folder for the deal
    let boxFolderId = null;
    try {
      const boxService = new BoxService();
      
      // Create main deal folder
      const dealFolder = await boxService.createFolder(name, '0'); // '0' is root folder ID
      boxFolderId = dealFolder.id;
      
      // Create subfolders for organization
      const subfolders = [
        'Documents',
        'Contracts', 
        'Financial',
        'Legal',
        'Due Diligence',
        'Communications',
        'Processed'
      ];

      for (const subfolder of subfolders) {
        await boxService.createFolder(subfolder, boxFolderId);
      }

      console.log('📁 Box.com folders created for deal:', name);

      // Update deal with Box folder ID
      await convex.mutation(api.deals.update, {
        dealId,
        updates: {
          metadata: {
            dealSize: dealSize || undefined,
            notes: notes || undefined,
            createdAt: new Date().toISOString(),
            phase: 'Setup',
            boxFolderId: boxFolderId,
            boxFolderName: name
          }
        }
      });

    } catch (boxError) {
      console.error('⚠️ Failed to create Box.com folder:', boxError);
      // Continue without Box integration - deal is still created
    }

    // Send Slack notification
    try {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (slackWebhookUrl) {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🎉 New Deal Created: ${name}`,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: '🎉 New Deal Created'
                }
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*Deal:* ${name}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Type:* ${dealType}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Priority:* ${priority}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Box Folder:* ${boxFolderId ? '✅ Created' : '❌ Failed'}`
                  }
                ]
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Description:* ${description}`
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
      dealId,
      boxFolderId,
      message: 'Deal created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating deal:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create deal', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}