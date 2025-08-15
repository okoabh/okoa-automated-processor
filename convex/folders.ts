import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new folder
export const create = mutation({
  args: {
    name: v.string(),
    status: v.optional(v.union(v.literal("ACTIVE"), v.literal("INACTIVE"))),
    boxFolderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const folderId = await ctx.db.insert("folders", {
      ...args,
      status: args.status || "ACTIVE",
      createdAt: Date.now(),
      documentCount: 0,
    });
    
    return folderId;
  },
});

// Update folder
export const update = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.optional(v.string()),
    boxFolderId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("ACTIVE"), v.literal("INACTIVE"))),
  },
  handler: async (ctx, { folderId, ...updates }) => {
    await ctx.db.patch(folderId, updates);
  },
});

// List all folders
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("ACTIVE"), v.literal("INACTIVE"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit = 50 }) => {
    let query = ctx.db.query("folders");
    
    if (status) {
      query = query.withIndex("by_status", (q) => q.eq("status", status));
    }
    
    return await query
      .order("desc")
      .take(limit);
  },
});

// Get folder by ID
export const get = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    return await ctx.db.get(folderId);
  },
});

// Get folder by string ID (for API routes)
export const getFolder = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id as any);
  },
});

// Get folder documents
export const getDocuments = query({
  args: { 
    folderId: v.id("folders"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { folderId, limit = 100 }) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_folderId", (q) => q.eq("folderId", folderId))
      .order("desc")
      .take(limit);
  },
});

// Update document count
export const updateDocumentCount = mutation({
  args: {
    folderId: v.id("folders"),
    change: v.number(),
  },
  handler: async (ctx, { folderId, change }) => {
    const folder = await ctx.db.get(folderId);
    if (!folder) return;
    
    await ctx.db.patch(folderId, {
      documentCount: Math.max(0, folder.documentCount + change),
    });
  },
});