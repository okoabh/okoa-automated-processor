import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Store pending Fireflies transcript processing requests
export const createPendingRequest = mutation({
  args: {
    transcriptId: v.string(),
    title: v.string(),
    date: v.string(),
    duration: v.number(),
    participants: v.array(v.object({
      name: v.string(),
      email: v.optional(v.string())
    })),
    summary: v.optional(v.string()),
    meetingUrl: v.optional(v.string()),
    rawTranscriptData: v.any(),
  },
  handler: async (ctx, args) => {
    const pendingId = await ctx.db.insert("firefliesPending", {
      ...args,
      status: "pending_approval",
      createdAt: Date.now(),
      suggestedDealId: null, // Could add logic to suggest deals
    });
    
    return pendingId;
  },
});

// List all pending transcript processing requests
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("firefliesPending")
      .withIndex("by_status", (q) => q.eq("status", "pending_approval"))
      .order("desc")
      .collect();
  },
});

// Process approved transcript
export const processTranscript = mutation({
  args: {
    transcriptId: v.string(),
    dealId: v.optional(v.id("deals")),
    approved: v.boolean(),
  },
  handler: async (ctx, { transcriptId, dealId, approved }) => {
    // Find the pending request
    const pendingRequest = await ctx.db
      .query("firefliesPending")
      .withIndex("by_transcriptId", (q) => q.eq("transcriptId", transcriptId))
      .first();
    
    if (!pendingRequest) {
      throw new Error("Pending request not found");
    }

    if (approved) {
      const date = new Date(pendingRequest.date);
      const filename = `${pendingRequest.title.replace(/[^a-zA-Z0-9]/g, '_')}_${date.toISOString().split('T')[0]}.txt`;
      const synthFilename = `30.01_${pendingRequest.title.replace(/[^a-zA-Z0-9]/g, '_')}_synth_${date.toISOString().split('T')[0]}.txt`;

      // Create the transcript document
      await ctx.db.insert("documents", {
        filename,
        originalFilename: filename,
        filePath: `/fireflies/transcripts/${filename}`,
        fileSize: JSON.stringify(pendingRequest.rawTranscriptData).length,
        mimeType: 'text/plain',
        dealId: dealId || undefined,
        documentType: 'meeting-transcript',
        category: 'communications',
        ddCode: '30.01',
        status: 'COMPLETED',
        createdAt: Date.now(),
        metadata: {
          source: 'fireflies.ai',
          transcriptId: pendingRequest.transcriptId,
          meetingUrl: pendingRequest.meetingUrl,
          duration: pendingRequest.duration,
          participants: pendingRequest.participants,
          firefliesTitle: pendingRequest.title,
          originalDate: pendingRequest.date,
          userApproved: true,
          approvedAt: Date.now(),
        },
      });

      // Create synthetic summary document
      await ctx.db.insert("documents", {
        filename: synthFilename,
        originalFilename: synthFilename,
        filePath: `/fireflies/synth_summaries/${synthFilename}`,
        fileSize: 0, // Will be updated when summary is generated
        mimeType: 'text/plain',
        dealId: dealId || undefined,
        documentType: 'synthetic-communication-summary',
        ddCode: '30.01',
        category: 'communications',
        status: 'PENDING',
        createdAt: Date.now(),
        metadata: {
          source: 'fireflies.ai',
          transcriptId: pendingRequest.transcriptId,
          originalTranscriptFile: filename,
          processingType: 'synthetic-summary',
          userApproved: true,
          approvedAt: Date.now(),
        },
      });

      // Update deal statistics if dealId provided
      if (dealId) {
        const deal = await ctx.db.get(dealId);
        if (deal) {
          await ctx.db.patch(dealId, {
            documentCount: deal.documentCount + 2, // transcript + synthetic summary
            updatedAt: Date.now(),
          });
        }
      }
    }

    // Update pending request status
    await ctx.db.patch(pendingRequest._id, {
      status: approved ? "approved" : "rejected",
      processedAt: Date.now(),
      assignedDealId: dealId || undefined,
    });

    return { processed: true, approved };
  },
});

// Reject transcript processing
export const rejectTranscript = mutation({
  args: {
    transcriptId: v.string(),
  },
  handler: async (ctx, { transcriptId }) => {
    const pendingRequest = await ctx.db
      .query("firefliesPending")
      .withIndex("by_transcriptId", (q) => q.eq("transcriptId", transcriptId))
      .first();
    
    if (!pendingRequest) {
      throw new Error("Pending request not found");
    }

    await ctx.db.patch(pendingRequest._id, {
      status: "rejected",
      processedAt: Date.now(),
    });

    return { rejected: true };
  },
});

// Get transcript processing history
export const getProcessingHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    return await ctx.db
      .query("firefliesPending")
      .order("desc")
      .take(limit);
  },
});