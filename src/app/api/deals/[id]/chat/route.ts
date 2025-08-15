import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../../../../../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { ClaudeProvider } from '@/lib/llm/providers/claude';
import fs from 'fs';
import path from 'path';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message, context } = body;

    // Get folder and documents
    const folder = await convex.query(api.folders.getFolder, { id });
    if (!folder) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const documents = await convex.query(api.documents.listByFolder, { folderId: id });

    // Load Midnight Atlas PRISM agent
    const agentPath = path.join(process.cwd(), 'src/lib/agents/MIDNIGHT_ATLAS_PRISM_v1.1_RE_EDITION.yaml');
    const agentConfig = fs.readFileSync(agentPath, 'utf-8');

    // Build context from documents
    let documentContext = '';
    if (documents.length > 0) {
      documentContext = `\n\n## DEAL DOCUMENTS CONTEXT:\n`;
      documents.forEach(doc => {
        documentContext += `- ${doc.name} (${doc.type})\n`;
      });
      
      // Add master synthdoc content if available
      const synthdoc = documents.find(doc => doc.name?.toLowerCase().includes('synthdoc'));
      if (synthdoc && synthdoc.content) {
        documentContext += `\n## MASTER SYNTHESIS DOCUMENT:\n${synthdoc.content.substring(0, 4000)}...\n`;
      }
    }

    // Check if this is the Wolfgramm deal and add specific context
    const isWolfgrammDeal = folder.name.toLowerCase().includes('wolfgramm');
    let wolfgrammContext = '';
    
    if (isWolfgrammDeal) {
      // Read the Wolfgramm deal document
      try {
        const wolfgrammDoc = fs.readFileSync('/Users/bradleyheitmann/Wolfgramm_Deals_AllDocs.txt', 'utf-8');
        wolfgrammContext = `\n\n## WOLFGRAMM ASCENT WALDORF DEAL CONTEXT:\n${wolfgrammDoc.substring(0, 8000)}...\n`;
      } catch (error) {
        console.log('Could not load Wolfgramm document:', error);
      }
    }

    // Prepare system prompt with agent config and context
    const systemPrompt = `${agentConfig}

## CURRENT DEAL CONTEXT:
You are analyzing documents for: ${folder.name}
Deal Status: ${folder.status}
Document Count: ${documents.length}
${documentContext}${wolfgrammContext}

## INSTRUCTIONS:
- Operate as Midnight Atlas PRISM v1.1 Real Estate Analysis Agent
- Provide detailed analysis following institutional-grade standards
- Reference specific documents and data points when available
- Include risk assessment and financial insights where relevant
- Use professional real estate analysis terminology
- Maintain OKOA Labs visual formatting standards`;

    // Initialize Claude
    const claude = new ClaudeProvider();
    
    const response = await claude.generateResponse({
      systemPrompt,
      userPrompt: message,
      maxTokens: 4000,
      temperature: 0.7
    });

    // Save chat interaction to database
    await convex.mutation(api.documents.createDocument, {
      folderId: id,
      name: `Chat_${Date.now()}`,
      type: 'chat',
      content: JSON.stringify({
        user_message: message,
        ai_response: response.content,
        timestamp: Date.now(),
        agent: 'MIDNIGHT_ATLAS_PRISM_v1.1'
      }),
      status: 'completed'
    });

    return NextResponse.json({
      response: response.content,
      agent: 'MIDNIGHT_ATLAS_PRISM_v1.1',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error in deal chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}