import { NextRequest } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  // Set up Server-Sent Events stream
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialData = {
        type: 'CONNECTION_ESTABLISHED',
        timestamp: Date.now(),
        message: 'Real-time processing updates connected'
      };
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\\n\\n`));
      
      // Set up interval to send updates
      const interval = setInterval(async () => {
        try {
          // Get real-time metrics from Convex
          const [queueOverview, agentStats, realTimeMetrics] = await Promise.all([
            convex.query('processingJobs:getQueueOverview'),
            convex.query('agents:getPoolStats'),
            convex.query('processingJobs:getRealTimeMetrics')
          ]);
          
          // Calculate current cost and tokens
          const currentCost = queueOverview.costSummary?.totalCost || 0;
          const currentTokens = queueOverview.costSummary?.totalTokens || 0;
          
          // Send metrics update
          const metricsUpdate = {
            type: 'METRICS_UPDATE',
            timestamp: Date.now(),
            tokens: currentTokens,
            cost: currentCost,
            documentsInQueue: queueOverview.queued,
            documentsProcessing: queueOverview.processing,
            queueDepth: queueOverview.queued,
            activeAgents: agentStats.warm + agentStats.processing,
            
            // Additional real-time data
            rates: {
              documentsPerHour: realTimeMetrics?.current?.processingRate || 0,
              costPerHour: realTimeMetrics?.current?.processingRate * (queueOverview.costSummary?.averageCostPerDocument || 0) || 0
            },
            
            // Agent breakdown
            agents: {
              total: agentStats.total,
              warm: agentStats.warm,
              processing: agentStats.processing,
              scalingUp: agentStats.scalingUp,
              scalingDown: agentStats.scalingDown
            },
            
            // Queue details
            queue: {
              pending: queueOverview.queued,
              processing: queueOverview.processing,
              completed24h: queueOverview.last24Hours?.completed || 0,
              failed24h: queueOverview.last24Hours?.failed || 0
            },
            
            // Performance metrics
            performance: {
              successRate: queueOverview.last24Hours?.total > 0 
                ? ((queueOverview.last24Hours.completed / queueOverview.last24Hours.total) * 100)
                : 0,
              averageProcessingTime: queueOverview.last24Hours?.averageProcessingTime || 0,
              averageCostPerDocument: queueOverview.costSummary?.averageCostPerDocument || 0
            }
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metricsUpdate)}\\n\\n`));
          
          // Send individual agent updates if there are active jobs
          if (realTimeMetrics?.activeJobs && realTimeMetrics.activeJobs.length > 0) {
            const agentUpdates = {
              type: 'AGENT_STATUS_UPDATE',
              timestamp: Date.now(),
              activeJobs: realTimeMetrics.activeJobs.map((job: any) => ({
                jobId: job.jobId,
                documentId: job.documentId,
                agentId: job.agentId,
                startedAt: job.startedAt,
                estimatedCost: job.estimatedCost,
                model: job.llmModel,
                processingTimeMs: Date.now() - job.startedAt,
              }))
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(agentUpdates)}\\n\\n`));
          }
          
        } catch (error) {
          console.error('Error fetching real-time metrics:', error);
          
          // Send error update
          const errorUpdate = {
            type: 'ERROR',
            timestamp: Date.now(),
            message: 'Failed to fetch metrics',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorUpdate)}\\n\\n`));
        }
      }, 2000); // Update every 2 seconds
      
      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
    
    cancel() {
      // Cleanup when stream is cancelled
      console.log('Real-time processing stream cancelled');
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

// Health check for the stream endpoint
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream'
    }
  });
}