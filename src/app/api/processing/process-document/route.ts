import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { BoxClient } from '../../../../lib/box/client';
import { ClaudeProvider } from '../../../../lib/llm/providers/claude';
import { OKOAAgentLoader } from '../../../../lib/agents/okoaAgentLoader';
import { AgentPool } from '../../../../lib/queue/agentPool';
import { SlackNotifier } from '../../../../lib/notifications/slack';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const boxClient = new BoxClient();
const claudeProvider = new ClaudeProvider();
const agentLoader = OKOAAgentLoader.getInstance();
const agentPool = new AgentPool(process.env.NEXT_PUBLIC_CONVEX_URL!);
const slackNotifier = new SlackNotifier();

export async function POST(request: NextRequest) {
  try {
    // Verify internal API authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { documentId, jobId, priority = 'NORMAL' } = await request.json();
    
    if (!documentId || !jobId) {
      return NextResponse.json({ error: 'documentId and jobId are required' }, { status: 400 });
    }
    
    console.log(`Starting document processing: ${documentId} (job: ${jobId})`);
    
    // Get document info
    const document = await convex.get('documents:get', { documentId });
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Get processing job info
    const job = await convex.get('processingJobs:getWithDocument', { jobId });
    if (!job) {
      return NextResponse.json({ error: 'Processing job not found' }, { status: 404 });
    }
    
    // Get or create agent
    const agent = await agentPool.getAvailableAgent('synthesis');
    let agentId: string;
    
    if (!agent) {
      console.log('No available agents - scaling up');
      await agentPool.scaleAgentPool(1, 300000); // Scale up for 1 document
      
      // Wait a moment for agent to be created
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAgent = await agentPool.getAvailableAgent('synthesis');
      if (!newAgent) {
        throw new Error('Failed to create agent for processing');
      }
      agentId = newAgent.agentId;
    } else {
      agentId = agent.agentId;
    }
    
    // Assign document to agent
    await agentPool.assignDocumentToAgent(agentId, documentId, jobId);
    
    // Update document status
    await convex.mutation('documents:updateStatus', {
      documentId,
      status: 'PROCESSING',
      processingStage: 'downloading_file',
      assignedAgentId: agentId,
      agentType: 'synthesis'
    });
    
    // Start processing job
    await convex.mutation('processingJobs:startProcessing', {
      jobId,
      agentId
    });
    
    try {
      // Step 1: Download file from Box.com
      console.log(`Agent ${agentId}: Downloading file from Box.com`);
      const fileContent = await boxClient.downloadFile(document.boxFileId!);
      const fileInfo = await boxClient.getFileInfo(document.boxFileId!);
      
      // Update document with file info
      await convex.mutation('documents:updateStatus', {
        documentId,
        status: 'PROCESSING',
        processingStage: 'extracting_text',
      });
      
      // Step 2: Extract text (simplified - would use OCR in production)
      let extractedText: string;
      if (fileInfo.name.toLowerCase().endsWith('.txt')) {
        extractedText = fileContent.toString('utf-8');
      } else {
        // For now, use filename and metadata as extracted text
        // In production, this would use Adobe PDF Services or Tesseract
        extractedText = `Document: ${fileInfo.name}\\nSize: ${fileInfo.size} bytes\\nType: ${fileInfo.extension}\\nUploaded: ${fileInfo.created_at}\\n\\n[OCR processing would extract actual content here]`;
      }
      
      // Step 3: Get agent prompt
      console.log(`Agent ${agentId}: Loading OKOA agent context`);
      const agentPrompt = await agentLoader.getAgentPrompt('synthesis');
      
      await convex.mutation('documents:updateStatus', {
        documentId,
        status: 'PROCESSING',
        processingStage: 'analyzing_content',
      });
      
      // Step 4: Process with Claude
      console.log(`Agent ${agentId}: Processing with Claude`);
      const processingResult = await claudeProvider.processWithAgent(
        extractedText,
        agentPrompt,
        'general',
        job.llmModel
      );
      
      // Step 5: Complete processing
      const processingTimeMs = await convex.mutation('processingJobs:complete', {
        jobId,
        actualTokens: processingResult.usage.totalTokens,
        actualCost: processingResult.cost,
        resultData: {
          extractedText,
          analysisResult: processingResult.content,
          metadata: {
            model: processingResult.model,
            provider: processingResult.provider,
            processingTime: processingResult.processingTime
          }
        }
      });
      
      // Complete agent processing
      await agentPool.completeAgentProcessing(
        agentId,
        processingResult.usage.totalTokens,
        processingResult.cost,
        processingTimeMs
      );
      
      // Update document status
      await convex.mutation('documents:updateStatus', {
        documentId,
        status: 'COMPLETED',
        processedAt: Date.now(),
      });
      
      console.log(`Agent ${agentId}: Processing completed successfully`);
      
      // Send success notification
      await slackNotifier.sendNotification({
        type: 'PROCESSING_COMPLETED',
        title: '✅ Document Processing Complete',
        message: `"${document.originalFilename}" has been successfully processed`,
        timestamp: Date.now(),
        data: {
          filename: document.originalFilename,
          documentId,
          jobId,
          agentId,
          processingTimeMs,
          actualCost: processingResult.cost,
          tokensUsed: processingResult.usage.totalTokens,
          model: processingResult.model,
          documentType: 'General',
          qualityScore: 95 // Would calculate based on processing metrics
        },
        dashboardUrl: `${process.env.NEXTAUTH_URL}/documents/${documentId}`
      });
      
      return NextResponse.json({
        success: true,
        documentId,
        jobId,
        agentId,
        processingTime: processingTimeMs,
        cost: processingResult.cost,
        tokensUsed: processingResult.usage.totalTokens
      });
      
    } catch (processingError) {
      console.error(`Agent ${agentId}: Processing failed:`, processingError);
      
      // Mark job as failed
      await convex.mutation('processingJobs:fail', {
        jobId,
        errorDetails: processingError instanceof Error ? processingError.message : 'Unknown processing error',
        retryable: true
      });
      
      // Update document status
      await convex.mutation('documents:updateStatus', {
        documentId,
        status: 'FAILED',
        errorMessage: processingError instanceof Error ? processingError.message : 'Processing failed'
      });
      
      // Release agent
      await convex.mutation('agents:updateStatus', {
        agentId,
        status: 'WARM'
      });
      
      // Send failure notification
      await slackNotifier.sendNotification({
        type: 'PROCESSING_FAILED',
        title: '❌ Document Processing Failed',
        message: `Failed to process "${document.originalFilename}"`,
        timestamp: Date.now(),
        data: {
          filename: document.originalFilename,
          documentId,
          jobId,
          agentId,
          errorMessage: processingError instanceof Error ? processingError.message : 'Unknown error',
          retryCount: job.retryCount + 1
        }
      });
      
      throw processingError;
    }
    
  } catch (error) {
    console.error('Document processing API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Check system health
    const agentStats = await agentPool.getPoolStats();
    const queueOverview = await convex.query('processingJobs:getQueueOverview');
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: Date.now(),
      agents: {
        total: agentStats.total,
        active: agentStats.warm + agentStats.processing,
        processing: agentStats.processing
      },
      queue: {
        pending: queueOverview.queued,
        processing: queueOverview.processing
      }
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}