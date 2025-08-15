import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new document record
export const create = mutation({
  args: {
    folderId: v.optional(v.id("folders")),
    dealId: v.optional(v.id("deals")),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.optional(v.string()),
    status: v.optional(v.union(v.literal("UPLOADED"), v.literal("PENDING"), v.literal("PROCESSING"), v.literal("COMPLETED"), v.literal("FAILED"))),
    uploadedAt: v.optional(v.string()),
    boxFileId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    // Legacy fields for compatibility
    filename: v.optional(v.string()),
    originalFilename: v.optional(v.string()),
    filePath: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    fileHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      ...args,
      status: args.status || "UPLOADED",
      createdAt: Date.now(),
    });
    
    return documentId;
  },
});

// Update document status and processing info
export const updateStatus = mutation({
  args: {
    documentId: v.id("documents"),
    status: v.union(v.literal("PENDING"), v.literal("PROCESSING"), v.literal("COMPLETED"), v.literal("FAILED")),
    processingStage: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    assignedAgentId: v.optional(v.string()),
    agentType: v.optional(v.string()),
    processedAt: v.optional(v.number()),
  },
  handler: async (ctx, { documentId, ...updates }) => {
    await ctx.db.patch(documentId, updates);
  },
});

// Update document classification
export const updateClassification = mutation({
  args: {
    documentId: v.id("documents"),
    documentType: v.string(),
    ddCode: v.string(),
    category: v.string(),
    classificationConfidence: v.number(),
  },
  handler: async (ctx, { documentId, ...classification }) => {
    await ctx.db.patch(documentId, classification);
  },
});

// Get all documents with optional filtering
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("PENDING"), v.literal("PROCESSING"), v.literal("COMPLETED"), v.literal("FAILED"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit = 50 }) => {
    let query = ctx.db.query("documents");
    
    if (status) {
      query = query.withIndex("by_status", (q) => q.eq("status", status));
    }
    
    return await query
      .order("desc")
      .take(limit);
  },
});

// Get document by ID
export const get = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    return await ctx.db.get(documentId);
  },
});

// Get documents by Box file ID
export const getByBoxFileId = query({
  args: { boxFileId: v.string() },
  handler: async (ctx, { boxFileId }) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_boxFileId", (q) => q.eq("boxFileId", boxFileId))
      .first();
  },
});

// Get processing queue (pending and processing documents)
export const getProcessingQueue = query({
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("documents")
      .withIndex("by_status", (q) => q.eq("status", "PENDING"))
      .order("desc")
      .collect();
      
    const processing = await ctx.db
      .query("documents")
      .withIndex("by_status", (q) => q.eq("status", "PROCESSING"))
      .order("desc")
      .collect();
    
    return {
      pending: pending.length,
      processing: processing.length,
      documents: {
        pending,
        processing,
      }
    };
  },
});

// Get processing statistics
export const getProcessingStats = query({
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Get all documents from last 24 hours
    const recentDocs = await ctx.db
      .query("documents")
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .collect();
    
    const stats = {
      total: recentDocs.length,
      completed: recentDocs.filter(d => d.status === "COMPLETED").length,
      processing: recentDocs.filter(d => d.status === "PROCESSING").length,
      pending: recentDocs.filter(d => d.status === "PENDING").length,
      failed: recentDocs.filter(d => d.status === "FAILED").length,
    };
    
    return {
      last24Hours: stats,
      successRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
    };
  },
});

// Create document with extended metadata for deal organization
export const createDocument = mutation({
  args: {
    folderId: v.string(),
    name: v.string(),
    type: v.string(),
    path: v.optional(v.string()),
    content: v.optional(v.string()),
    status: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      ...args,
      status: args.status || "pending",
      createdAt: Date.now(),
      fileName: args.name,
      fileSize: args.content?.length || 0,
    });
    
    return documentId;
  },
});

// Get documents by folder ID
export const listByFolder = query({
  args: { folderId: v.string() },
  handler: async (ctx, { folderId }) => {
    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("folderId"), folderId))
      .order("desc")
      .collect();
  },
});