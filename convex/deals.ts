import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new deal
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    dealType: v.string(), // e.g., "real-estate", "acquisition", "refinancing"
    status: v.optional(v.union(
      v.literal("ACTIVE"),
      v.literal("COMPLETED"), 
      v.literal("ON_HOLD"),
      v.literal("CANCELLED")
    )),
    boxFolderId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const dealId = await ctx.db.insert("deals", {
      ...args,
      status: args.status || "ACTIVE",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      documentCount: 0,
      totalProcessingCost: 0,
    });
    
    return dealId;
  },
});

// Update deal information
export const update = mutation({
  args: {
    dealId: v.id("deals"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      dealType: v.optional(v.string()),
      status: v.optional(v.union(
        v.literal("ACTIVE"),
        v.literal("COMPLETED"),
        v.literal("ON_HOLD"), 
        v.literal("CANCELLED")
      )),
      boxFolderId: v.optional(v.string()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { dealId, updates }) => {
    await ctx.db.patch(dealId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Update deal statistics (called when documents are processed)
export const updateStats = mutation({
  args: {
    dealId: v.id("deals"),
    documentCountChange: v.optional(v.number()),
    costChange: v.optional(v.number()),
  },
  handler: async (ctx, { dealId, documentCountChange = 0, costChange = 0 }) => {
    const deal = await ctx.db.get(dealId);
    if (!deal) return;
    
    await ctx.db.patch(dealId, {
      documentCount: deal.documentCount + documentCountChange,
      totalProcessingCost: deal.totalProcessingCost + costChange,
      updatedAt: Date.now(),
    });
  },
});

// Get all deals
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("ACTIVE"),
      v.literal("COMPLETED"),
      v.literal("ON_HOLD"),
      v.literal("CANCELLED")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit = 50 }) => {
    let query = ctx.db.query("deals");
    
    if (status) {
      query = query.withIndex("by_status", (q) => q.eq("status", status));
    }
    
    return await query
      .order("desc")
      .take(limit);
  },
});

// Get deal by ID
export const get = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, { dealId }) => {
    return await ctx.db.get(dealId);
  },
});

// Get deal by ID (alternative name for compatibility)
export const getById = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, { dealId }) => {
    return await ctx.db.get(dealId);
  },
});

// Get deal by Box folder ID
export const getByBoxFolderId = query({
  args: { boxFolderId: v.string() },
  handler: async (ctx, { boxFolderId }) => {
    return await ctx.db
      .query("deals")
      .withIndex("by_boxFolderId", (q) => q.eq("boxFolderId", boxFolderId))
      .first();
  },
});

// Get deal documents
export const getDocuments = query({
  args: { 
    dealId: v.id("deals"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { dealId, limit = 100 }) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_dealId", (q) => q.eq("dealId", dealId))
      .order("desc")
      .take(limit);
  },
});

// Get deal processing statistics
export const getProcessingStats = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, { dealId }) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_dealId", (q) => q.eq("dealId", dealId))
      .collect();
    
    const jobs = await Promise.all(
      documents.map(doc => 
        ctx.db
          .query("processingJobs")
          .withIndex("by_documentId", (q) => q.eq("documentId", doc._id))
          .collect()
      )
    );
    
    const allJobs = jobs.flat();
    const completedJobs = allJobs.filter(job => job.status === "COMPLETED");
    
    return {
      totalDocuments: documents.length,
      completedDocuments: documents.filter(d => d.status === "COMPLETED").length,
      processingDocuments: documents.filter(d => d.status === "PROCESSING").length,
      failedDocuments: documents.filter(d => d.status === "FAILED").length,
      
      totalCost: completedJobs.reduce((sum, job) => sum + (job.actualCost || 0), 0),
      totalTokens: completedJobs.reduce((sum, job) => sum + (job.actualTokens || 0), 0),
      averageProcessingTime: completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => sum + (job.processingTimeMs || 0), 0) / completedJobs.length
        : 0,
      
      successRate: documents.length > 0
        ? (documents.filter(d => d.status === "COMPLETED").length / documents.length) * 100
        : 0,
    };
  },
});

// Delete deal (and optionally its documents)
export const remove = mutation({
  args: { 
    dealId: v.id("deals"),
    deleteDocuments: v.optional(v.boolean()),
  },
  handler: async (ctx, { dealId, deleteDocuments = false }) => {
    if (deleteDocuments) {
      // Delete all associated documents and jobs
      const documents = await ctx.db
        .query("documents")
        .withIndex("by_dealId", (q) => q.eq("dealId", dealId))
        .collect();
      
      for (const doc of documents) {
        // Delete associated jobs
        const jobs = await ctx.db
          .query("processingJobs")
          .withIndex("by_documentId", (q) => q.eq("documentId", doc._id))
          .collect();
        
        for (const job of jobs) {
          await ctx.db.delete(job._id);
        }
        
        // Delete document
        await ctx.db.delete(doc._id);
      }
    }
    
    // Delete the deal
    await ctx.db.delete(dealId);
  },
});