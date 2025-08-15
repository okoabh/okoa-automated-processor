import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

// Create a new agent
export const create = mutation({
  args: {
    agentId: v.string(),
    agentType: v.union(v.literal("synthesis"), v.literal("midnight-atlas"), v.literal("dd-framework")),
    contextSize: v.optional(v.number()),
    contextCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.insert("agents", {
      ...args,
      status: "SCALING_UP",
      contextLoaded: false,
      documentsProcessed: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    });
    
    return agent;
  },
});

// Update agent status
export const updateStatus = mutation({
  args: {
    agentId: v.string(),
    status: v.union(
      v.literal("WARM"), 
      v.literal("PROCESSING"), 
      v.literal("SCALING_UP"), 
      v.literal("SCALING_DOWN"), 
      v.literal("ERROR")
    ),
    contextLoaded: v.optional(v.boolean()),
    lastActiveAt: v.optional(v.number()),
  },
  handler: async (ctx, { agentId, ...updates }) => {
    const agent = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("agentId"), agentId))
      .first();
    
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    await ctx.db.patch(agent._id, {
      ...updates,
      lastActiveAt: updates.lastActiveAt ?? Date.now(),
    });
  },
});

// Assign document to agent
export const assignDocument = mutation({
  args: {
    agentId: v.string(),
    documentId: v.id("documents"),
    jobId: v.id("processingJobs"),
  },
  handler: async (ctx, { agentId, documentId, jobId }) => {
    const agent = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("agentId"), agentId))
      .first();
    
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    await ctx.db.patch(agent._id, {
      status: "PROCESSING",
      currentDocumentId: documentId,
      currentJobId: jobId,
      lastActiveAt: Date.now(),
    });
  },
});

// Complete document processing for agent
export const completeProcessing = mutation({
  args: {
    agentId: v.string(),
    tokensUsed: v.number(),
    costIncurred: v.number(),
    processingTimeMs: v.number(),
  },
  handler: async (ctx, { agentId, tokensUsed, costIncurred, processingTimeMs }) => {
    const agent = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("agentId"), agentId))
      .first();
    
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    // Calculate new averages
    const newDocCount = agent.documentsProcessed + 1;
    const newAvgTime = agent.averageProcessingTime 
      ? ((agent.averageProcessingTime * agent.documentsProcessed) + processingTimeMs) / newDocCount
      : processingTimeMs;
    
    await ctx.db.patch(agent._id, {
      status: "WARM",
      currentDocumentId: undefined,
      currentJobId: undefined,
      documentsProcessed: newDocCount,
      totalTokensUsed: agent.totalTokensUsed + tokensUsed,
      totalCost: agent.totalCost + costIncurred,
      averageProcessingTime: newAvgTime,
      lastActiveAt: Date.now(),
    });
  },
});

// Get all active agents
export const getActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status")
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "WARM"),
          q.eq(q.field("status"), "PROCESSING"),
          q.eq(q.field("status"), "SCALING_UP")
        )
      )
      .collect();
  },
});

// Get available agents (warm and ready)
export const getAvailable = query({
  args: {
    agentType: v.optional(v.union(v.literal("synthesis"), v.literal("midnight-atlas"), v.literal("dd-framework"))),
  },
  handler: async (ctx, { agentType }) => {
    let query = ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "WARM"));
    
    let agents = await query.collect();
    
    if (agentType) {
      agents = agents.filter(agent => agent.agentType === agentType);
    }
    
    return agents.filter(agent => agent.contextLoaded);
  },
});

// Get agent pool statistics
export const getPoolStats = query({
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    
    const stats = {
      total: agents.length,
      warm: agents.filter(a => a.status === "WARM").length,
      processing: agents.filter(a => a.status === "PROCESSING").length,
      scalingUp: agents.filter(a => a.status === "SCALING_UP").length,
      scalingDown: agents.filter(a => a.status === "SCALING_DOWN").length,
      error: agents.filter(a => a.status === "ERROR").length,
      
      byType: {
        synthesis: agents.filter(a => a.agentType === "synthesis").length,
        midnightAtlas: agents.filter(a => a.agentType === "midnight-atlas").length,
        ddFramework: agents.filter(a => a.agentType === "dd-framework").length,
      },
      
      totalCost: agents.reduce((sum, a) => sum + (a.contextCost || 0), 0),
      totalDocumentsProcessed: agents.reduce((sum, a) => sum + a.documentsProcessed, 0),
      averageProcessingTime: agents.length > 0 
        ? agents.reduce((sum, a) => sum + (a.averageProcessingTime || 0), 0) / agents.length
        : 0,
    };
    
    return stats;
  },
});

// Schedule agents for shutdown (cost optimization)
export const scheduleShutdown = mutation({
  args: {
    agentIds: v.array(v.string()),
    shutdownAfterMs: v.number(),
  },
  handler: async (ctx, { agentIds, shutdownAfterMs }) => {
    const shutdownTime = Date.now() + shutdownAfterMs;
    
    for (const agentId of agentIds) {
      const agent = await ctx.db
        .query("agents")
        .filter((q) => q.eq(q.field("agentId"), agentId))
        .first();
      
      if (agent && agent.status === "WARM") {
        await ctx.db.patch(agent._id, {
          scheduledForShutdown: shutdownTime,
        });
      }
    }
  },
});

// Clean up idle agents (called by cron job)
export const cleanupIdleAgents = action({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const idleThreshold = 5 * 60 * 1000; // 5 minutes
    
    const agents = await ctx.runQuery("agents:getActive");
    
    const idleAgents = agents.filter(agent => {
      const isIdle = (now - agent.lastActiveAt) > idleThreshold;
      const isScheduledForShutdown = agent.scheduledForShutdown && now >= agent.scheduledForShutdown;
      
      return (isIdle || isScheduledForShutdown) && agent.status === "WARM";
    });
    
    // Remove idle agents
    for (const agent of idleAgents) {
      await ctx.runMutation("agents:remove", { agentId: agent.agentId });
    }
    
    return {
      cleaned: idleAgents.length,
      remaining: agents.length - idleAgents.length,
    };
  },
});

// Remove an agent
export const remove = mutation({
  args: { agentId: v.string() },
  handler: async (ctx, { agentId }) => {
    const agent = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("agentId"), agentId))
      .first();
    
    if (agent) {
      await ctx.db.delete(agent._id);
      return true;
    }
    
    return false;
  },
});