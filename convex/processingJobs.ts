import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new processing job
export const create = mutation({
  args: {
    documentId: v.id("documents"),
    jobType: v.string(),
    priority: v.optional(v.number()),
    agentType: v.optional(v.string()),
    llmProvider: v.string(),
    llmModel: v.string(),
    estimatedTokens: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.insert("processingJobs", {
      ...args,
      priority: args.priority || 5,
      status: "QUEUED",
      retryCount: 0,
      queuedAt: Date.now(),
    });
    
    return job;
  },
});

// Start processing a job
export const startProcessing = mutation({
  args: {
    jobId: v.id("processingJobs"),
    agentId: v.string(),
  },
  handler: async (ctx, { jobId, agentId }) => {
    await ctx.db.patch(jobId, {
      status: "PROCESSING",
      agentId,
      startedAt: Date.now(),
    });
  },
});

// Complete a processing job
export const complete = mutation({
  args: {
    jobId: v.id("processingJobs"),
    actualTokens: v.number(),
    actualCost: v.number(),
    resultData: v.any(),
  },
  handler: async (ctx, { jobId, actualTokens, actualCost, resultData }) => {
    const job = await ctx.db.get(jobId);
    if (!job) throw new Error("Job not found");
    
    const completedAt = Date.now();
    const processingTimeMs = job.startedAt ? completedAt - job.startedAt : 0;
    
    await ctx.db.patch(jobId, {
      status: "COMPLETED",
      actualTokens,
      actualCost,
      resultData,
      completedAt,
      processingTimeMs,
    });
    
    return processingTimeMs;
  },
});

// Fail a processing job
export const fail = mutation({
  args: {
    jobId: v.id("processingJobs"),
    errorDetails: v.string(),
    retryable: v.optional(v.boolean()),
  },
  handler: async (ctx, { jobId, errorDetails, retryable = true }) => {
    const job = await ctx.db.get(jobId);
    if (!job) throw new Error("Job not found");
    
    const newRetryCount = job.retryCount + 1;
    const maxRetries = 3;
    
    if (retryable && newRetryCount <= maxRetries) {
      // Retry the job
      await ctx.db.patch(jobId, {
        status: "QUEUED",
        errorDetails,
        retryCount: newRetryCount,
        agentId: undefined,
        startedAt: undefined,
      });
    } else {
      // Mark as permanently failed
      await ctx.db.patch(jobId, {
        status: "FAILED",
        errorDetails,
        retryCount: newRetryCount,
        completedAt: Date.now(),
      });
    }
  },
});

// Get queued jobs (sorted by priority)
export const getQueued = query({
  args: {
    limit: v.optional(v.number()),
    agentType: v.optional(v.string()),
  },
  handler: async (ctx, { limit = 10, agentType }) => {
    let jobs = await ctx.db
      .query("processingJobs")
      .withIndex("by_status", (q) => q.eq("status", "QUEUED"))
      .collect();
    
    // Filter by agent type if specified
    if (agentType) {
      jobs = jobs.filter(job => job.agentType === agentType);
    }
    
    // Sort by priority (lower number = higher priority)
    jobs.sort((a, b) => a.priority - b.priority);
    
    return jobs.slice(0, limit);
  },
});

// Get processing jobs by status
export const getByStatus = query({
  args: {
    status: v.union(v.literal("QUEUED"), v.literal("PROCESSING"), v.literal("COMPLETED"), v.literal("FAILED")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit = 50 }) => {
    return await ctx.db
      .query("processingJobs")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .take(limit);
  },
});

// Get job by ID with document info
export const getWithDocument = query({
  args: { jobId: v.id("processingJobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.db.get(jobId);
    if (!job) return null;
    
    const document = await ctx.db.get(job.documentId);
    
    return {
      ...job,
      document,
    };
  },
});

// Get processing queue overview
export const getQueueOverview = query({
  handler: async (ctx) => {
    const jobs = await ctx.db.query("processingJobs").collect();
    
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const recentJobs = jobs.filter(job => job.queuedAt >= last24Hours);
    
    return {
      total: jobs.length,
      queued: jobs.filter(j => j.status === "QUEUED").length,
      processing: jobs.filter(j => j.status === "PROCESSING").length,
      completed: jobs.filter(j => j.status === "COMPLETED").length,
      failed: jobs.filter(j => j.status === "FAILED").length,
      
      last24Hours: {
        total: recentJobs.length,
        completed: recentJobs.filter(j => j.status === "COMPLETED").length,
        failed: recentJobs.filter(j => j.status === "FAILED").length,
        averageProcessingTime: recentJobs.length > 0
          ? recentJobs
              .filter(j => j.processingTimeMs)
              .reduce((sum, j) => sum + (j.processingTimeMs || 0), 0) / recentJobs.filter(j => j.processingTimeMs).length
          : 0,
      },
      
      costSummary: {
        totalCost: recentJobs.reduce((sum, j) => sum + (j.actualCost || 0), 0),
        totalTokens: recentJobs.reduce((sum, j) => sum + (j.actualTokens || 0), 0),
        averageCostPerDocument: recentJobs.length > 0
          ? recentJobs.reduce((sum, j) => sum + (j.actualCost || 0), 0) / recentJobs.length
          : 0,
      }
    };
  },
});

// Get jobs by agent
export const getByAgent = query({
  args: { 
    agentId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { agentId, limit = 20 }) => {
    return await ctx.db
      .query("processingJobs")
      .withIndex("by_agentId", (q) => q.eq("agentId", agentId))
      .order("desc")
      .take(limit);
  },
});

// Get real-time processing metrics
export const getRealTimeMetrics = query({
  handler: async (ctx) => {
    const jobs = await ctx.db.query("processingJobs").collect();
    const now = Date.now();
    
    const processingJobs = jobs.filter(j => j.status === "PROCESSING");
    const queuedJobs = jobs.filter(j => j.status === "QUEUED");
    
    // Calculate current processing rate
    const last5Minutes = now - (5 * 60 * 1000);
    const recentCompleted = jobs.filter(j => 
      j.status === "COMPLETED" && 
      j.completedAt && 
      j.completedAt >= last5Minutes
    );
    
    const processingRate = recentCompleted.length / 5; // docs per minute
    
    // Estimate completion time for queue
    const estimatedCompletionMinutes = processingRate > 0 
      ? Math.ceil(queuedJobs.length / processingRate)
      : null;
    
    return {
      current: {
        processing: processingJobs.length,
        queued: queuedJobs.length,
        processingRate: processingRate * 60, // docs per hour
      },
      
      estimates: {
        queueCompletionMinutes: estimatedCompletionMinutes,
        queueCompletionETA: estimatedCompletionMinutes 
          ? new Date(now + (estimatedCompletionMinutes * 60 * 1000))
          : null,
      },
      
      activeJobs: processingJobs.map(job => ({
        jobId: job._id,
        documentId: job.documentId,
        agentId: job.agentId,
        startedAt: job.startedAt,
        estimatedCost: job.estimatedCost,
        llmModel: job.llmModel,
      })),
    };
  },
});