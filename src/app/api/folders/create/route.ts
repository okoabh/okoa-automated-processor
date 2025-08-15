import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { BoxService } from '@/lib/integrations/box';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const folderName = name.trim();
    console.log('📁 Creating folder:', folderName);

    // Create folder in Convex database
    const folderId = await convex.mutation(api.folders.create, {
      name: folderName,
      status: 'ACTIVE'
    });

    console.log('✅ Folder created in database:', folderId);

    // Create Box.com folder
    let boxFolderId = null;
    try {
      const boxService = new BoxService();
      const boxFolder = await boxService.createFolder(folderName, '0');
      boxFolderId = boxFolder.id;
      
      console.log('📁 Box.com folder created:', boxFolderId);

      // Update folder with Box folder ID
      await convex.mutation(api.folders.update, {
        folderId,
        boxFolderId
      });

    } catch (boxError) {
      console.error('⚠️ Failed to create Box.com folder:', boxError);
      // Continue without Box integration
    }

    // Send Slack notification
    try {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (slackWebhookUrl) {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `📁 New Folder Created: ${folderName}`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `📁 *New Folder Created*\n*Name:* ${folderName}\n*Box Folder:* ${boxFolderId ? '✅ Created' : '❌ Failed'}\n*Ready for document uploads*`
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
      folderId,
      boxFolderId,
      name: folderName
    });

  } catch (error) {
    console.error('❌ Error creating folder:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create folder', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}