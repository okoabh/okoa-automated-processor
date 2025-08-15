import { ConvexHttpClient } from 'convex/browser';
import { ClaudeProvider } from '../llm/providers/claude';
import { OKOAAgentLoader } from '../agents/okoaAgentLoader';
import { SlackNotifier } from '../notifications/slack';
import type { AgentPoolConfig, Agent } from '../../types';

export class AgentPool {
  private convex: ConvexHttpClient;
  private claudeProvider: ClaudeProvider;
  private agentLoader: OKOAAgentLoader;
  private slackNotifier: SlackNotifier;
  private config: AgentPoolConfig;
  
  constructor(convexUrl: string) {
    this.convex = new ConvexHttpClient(convexUrl);
    this.claudeProvider = new ClaudeProvider();
    this.agentLoader = OKOAAgentLoader.getInstance();
    this.slackNotifier = new SlackNotifier();
    
    this.config = {
      scaling: {
        minAgents: 1,
        maxAgents: parseInt(process.env.MAX_AGENTS || '5'),
        scaleUpThreshold: 3,
        scaleDownDelay: 300000, // 5 minutes
      },
      costControls: {
        dailyAgentBudget: parseFloat(process.env.DAILY_COST_LIMIT || '50'),
        maxConcurrentCost: parseFloat(process.env.HOURLY_COST_LIMIT || '15'),
      },
    };
  }
  
  async scaleAgentPool(queueDepth: number, avgProcessingTime: number = 300000): Promise<void> {
    const currentAgents = await this.getActiveAgents();
    const optimalAgentCount = this.calculateOptimalAgentCount(queueDepth, avgProcessingTime, currentAgents.length);
    
    if (optimalAgentCount > currentAgents.length) {
      await this.scaleUp(optimalAgentCount - currentAgents.length);
    } else if (optimalAgentCount < currentAgents.length) {
      await this.scaleDown(currentAgents.length - optimalAgentCount);
    }
  }
  
  private calculateOptimalAgentCount(queueDepth: number, avgProcessingTime: number, currentAgents: number): number {
    if (queueDepth === 0) {
      return Math.max(1, this.config.scaling.minAgents); // Keep minimum agents warm
    }
    
    // Calculate wait time with current agents
    const estimatedWaitTime = (queueDepth * avgProcessingTime) / Math.max(currentAgents, 1);
    const maxAcceptableWaitTime = 10 * 60 * 1000; // 10 minutes
    
    if (estimatedWaitTime > maxAcceptableWaitTime) {
      // Scale up to meet wait time requirement
      const neededAgents = Math.ceil((queueDepth * avgProcessingTime) / maxAcceptableWaitTime);
      return Math.min(neededAgents, this.config.scaling.maxAgents);
    }
    
    // Scale based on queue threshold
    if (queueDepth >= this.config.scaling.scaleUpThreshold) {
      return Math.min(Math.ceil(queueDepth / 2), this.config.scaling.maxAgents);
    }
    
    return Math.max(this.config.scaling.minAgents, Math.ceil(queueDepth / 3));
  }
  
  private async scaleUp(additionalAgents: number): Promise<void> {
    const contextCost = this.agentLoader.getContextCost();
    const totalCost = additionalAgents * contextCost;
    
    // Check cost constraints
    const currentDailyCost = await this.getCurrentDailyCost();
    if (currentDailyCost + totalCost > this.config.costControls.dailyAgentBudget) {
      console.warn(`Scaling limited by daily budget. Current: $${currentDailyCost}, Would add: $${totalCost}`);
      additionalAgents = Math.floor((this.config.costControls.dailyAgentBudget - currentDailyCost) / contextCost);
    }
    
    if (additionalAgents <= 0) return;
    
    console.log(`Scaling up by ${additionalAgents} agents (est. cost: $${totalCost.toFixed(2)})`);
    
    // Create new agents
    const newAgents = await Promise.all(
      Array.from({ length: additionalAgents }, (_, i) => this.createAgent(i))
    );
    
    // Notify Slack
    await this.slackNotifier.sendNotification({
      type: 'PROCESSING_STARTED',
      title: '🚀 Scaling Up Agents',
      message: `Added ${newAgents.length} agents to handle increased workload`,
      data: { newAgentCount: newAgents.length, totalCost },
      timestamp: Date.now(),
    });
  }
  
  private async scaleDown(agentsToRemove: number): Promise<void> {
    const availableAgents = await this.getAvailableAgents();
    const agentsToShutdown = availableAgents
      .slice(this.config.scaling.minAgents) // Keep minimum agents
      .slice(0, agentsToRemove);
    
    if (agentsToShutdown.length === 0) return;
    
    console.log(`Scheduling ${agentsToShutdown.length} agents for shutdown`);
    
    // Schedule for shutdown after delay
    await this.convex.mutation('agents:scheduleShutdown', {
      agentIds: agentsToShutdown.map(a => a.agentId),
      shutdownAfterMs: this.config.scaling.scaleDownDelay,
    });
  }
  
  private async createAgent(index: number): Promise<string> {
    const agentId = `agent-${Date.now()}-${index}`;
    const agentType = this.selectAgentType();
    
    // Create agent record in database
    await this.convex.mutation('agents:create', {
      agentId,
      agentType,
      contextSize: this.agentLoader.getContextSize(),
      contextCost: this.agentLoader.getContextCost(),
    });
    
    // Load OKOA context for the agent (this incurs cost)
    try {
      await this.agentLoader.loadAgentContext();
      
      // Mark agent as ready
      await this.convex.mutation('agents:updateStatus', {
        agentId,
        status: 'WARM',
        contextLoaded: true,
      });
      
      console.log(`Agent ${agentId} created and warmed (type: ${agentType})`);
      return agentId;
    } catch (error) {
      console.error(`Failed to warm agent ${agentId}:`, error);
      
      await this.convex.mutation('agents:updateStatus', {
        agentId,
        status: 'ERROR',
        contextLoaded: false,
      });
      
      throw error;
    }
  }
  
  private selectAgentType(): 'synthesis' | 'midnight-atlas' | 'dd-framework' {
    // For now, default to synthesis agent
    // TODO: Add logic to select based on current queue composition
    return 'synthesis';
  }
  
  async getAvailableAgent(agentType?: string): Promise<Agent | null> {
    const availableAgents = await this.convex.query('agents:getAvailable', { agentType });
    
    if (availableAgents.length === 0) {
      return null;
    }
    
    // Return agent with least documents processed (load balancing)
    return availableAgents.reduce((leastUsed, current) =>
      current.documentsProcessed < leastUsed.documentsProcessed ? current : leastUsed
    );
  }
  
  async assignDocumentToAgent(agentId: string, documentId: string, jobId: string): Promise<void> {
    await this.convex.mutation('agents:assignDocument', {
      agentId,
      documentId,
      jobId,
    });
  }
  
  async completeAgentProcessing(
    agentId: string,
    tokensUsed: number,
    costIncurred: number,
    processingTimeMs: number
  ): Promise<void> {
    await this.convex.mutation('agents:completeProcessing', {
      agentId,
      tokensUsed,
      costIncurred,
      processingTimeMs,
    });
  }
  
  private async getActiveAgents(): Promise<Agent[]> {
    return await this.convex.query('agents:getActive');
  }
  
  private async getAvailableAgents(): Promise<Agent[]> {
    return await this.convex.query('agents:getAvailable');
  }
  
  private async getCurrentDailyCost(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const costTracking = await this.convex.query('costTracking:getDailyCost', { date: today });
    return costTracking?.totalCost || 0;
  }
  
  async getPoolStats() {
    return await this.convex.query('agents:getPoolStats');
  }
  
  async cleanupIdleAgents(): Promise<void> {
    await this.convex.action('agents:cleanupIdleAgents', {});
  }
  
  // Monitor pool health and auto-scale
  async monitorAndScale(): Promise<void> {
    try {
      const queueOverview = await this.convex.query('processingJobs:getQueueOverview');
      const poolStats = await this.getPoolStats();
      
      // Auto-scale based on queue depth
      if (queueOverview.queued > 0) {
        await this.scaleAgentPool(queueOverview.queued, queueOverview.last24Hours.averageProcessingTime);
      }
      
      // Cost monitoring
      const currentDailyCost = await this.getCurrentDailyCost();
      if (currentDailyCost > this.config.costControls.dailyAgentBudget * 0.9) {
        await this.slackNotifier.sendNotification({
          type: 'COST_ALERT',
          title: '⚠️ Daily Cost Alert',
          message: `Daily cost approaching limit: $${currentDailyCost.toFixed(2)} / $${this.config.costControls.dailyAgentBudget}`,
          timestamp: Date.now(),
        });
      }
      
      console.log(`Agent Pool Status - Active: ${poolStats.total}, Queue: ${queueOverview.queued}, Daily Cost: $${currentDailyCost.toFixed(2)}`);
    } catch (error) {
      console.error('Agent pool monitoring failed:', error);
    }
  }
}