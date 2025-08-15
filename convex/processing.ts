import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Queue a document for processing
export const queueDocument = mutation({
  args: {
    documentId: v.id("documents"),
    dealId: v.optional(v.id("deals")),
    priority: v.optional(v.union(v.literal("LOW"), v.literal("NORMAL"), v.literal("HIGH"), v.literal("URGENT"))),
    processingType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("processingJobs", {
      ...args,
      status: "QUEUED",
      priority: args.priority || "NORMAL",
      processingType: args.processingType || "FULL_ANALYSIS",
      createdAt: Date.now(),
      queuedAt: Date.now(),
    });
    
    // Update document status
    await ctx.db.patch(args.documentId, {
      status: "PENDING",
    });
    
    return jobId;
  },
});

// Get processing queue
export const getQueue = query({
  args: {
    status: v.optional(v.union(v.literal("QUEUED"), v.literal("PROCESSING"), v.literal("COMPLETED"), v.literal("FAILED"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit = 50 }) => {
    let query = ctx.db.query("processingJobs");
    
    if (status) {
      query = query.withIndex("by_status", (q) => q.eq("status", status));
    }
    
    return await query
      .order("desc")
      .take(limit);
  },
});

// Start processing a job
export const startProcessing = mutation({
  args: {
    jobId: v.id("processingJobs"),
    agentId: v.string(),
    agentType: v.optional(v.string()),
  },
  handler: async (ctx, { jobId, agentId, agentType }) => {
    const job = await ctx.db.get(jobId);
    if (!job) return null;
    
    await ctx.db.patch(jobId, {
      status: "PROCESSING",
      agentId,
      agentType,
      startedAt: Date.now(),
    });
    
    // Update document status
    if (job.documentId) {
      await ctx.db.patch(job.documentId, {
        status: "PROCESSING",
        assignedAgentId: agentId,
        agentType,
      });
    }
    
    return job;
  },
});

// Complete processing job
export const completeJob = mutation({
  args: {
    jobId: v.id("processingJobs"),
    success: v.boolean(),
    result: v.optional(v.any()),
    errorMessage: v.optional(v.string()),
    actualCost: v.optional(v.number()),
    actualTokens: v.optional(v.number()),
  },
  handler: async (ctx, { jobId, success, result, errorMessage, actualCost, actualTokens }) => {
    const job = await ctx.db.get(jobId);
    if (!job) return;
    
    const completedAt = Date.now();
    const processingTimeMs = job.startedAt ? completedAt - job.startedAt : 0;
    
    await ctx.db.patch(jobId, {
      status: success ? "COMPLETED" : "FAILED",
      completedAt,
      processingTimeMs,
      result,
      errorMessage,
      actualCost,
      actualTokens,
    });
    
    // Update document status
    if (job.documentId) {
      await ctx.db.patch(job.documentId, {
        status: success ? "COMPLETED" : "FAILED",
        processedAt: completedAt,
        errorMessage,
      });
    }
    
    // Update deal statistics if dealId exists
    if (job.dealId && success && actualCost) {
      const deal = await ctx.db.get(job.dealId);
      if (deal) {
        await ctx.db.patch(job.dealId, {
          documentCount: deal.documentCount + 1,
          totalProcessingCost: deal.totalProcessingCost + actualCost,
          updatedAt: Date.now(),
        });
      }
    }
  },
});

// Get processing statistics
export const getStats = query({
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Get recent jobs
    const recentJobs = await ctx.db
      .query("processingJobs")
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .collect();
    
    const completedJobs = recentJobs.filter(j => j.status === "COMPLETED");
    const failedJobs = recentJobs.filter(j => j.status === "FAILED");
    
    return {
      last24Hours: {
        total: recentJobs.length,
        completed: completedJobs.length,
        failed: failedJobs.length,
        processing: recentJobs.filter(j => j.status === "PROCESSING").length,
        queued: recentJobs.filter(j => j.status === "QUEUED").length,
      },
      totalCost: completedJobs.reduce((sum, job) => sum + (job.actualCost || 0), 0),
      totalTokens: completedJobs.reduce((sum, job) => sum + (job.actualTokens || 0), 0),
      averageProcessingTime: completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => sum + (job.processingTimeMs || 0), 0) / completedJobs.length
        : 0,
      successRate: recentJobs.length > 0
        ? (completedJobs.length / recentJobs.length) * 100
        : 0,
    };
  },
});