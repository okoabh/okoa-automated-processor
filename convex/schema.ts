import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Deals table
  deals: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    dealType: v.string(), // e.g., "real-estate", "acquisition", "refinancing"
    status: v.union(
      v.literal("ACTIVE"),
      v.literal("COMPLETED"),
      v.literal("ON_HOLD"),
      v.literal("CANCELLED")
    ),
    
    // Box.com integration
    boxFolderId: v.optional(v.string()),
    
    // Statistics
    documentCount: v.number(),
    totalProcessingCost: v.number(),
    
    // Metadata
    metadata: v.optional(v.any()),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_dealType", ["dealType"])
    .index("by_boxFolderId", ["boxFolderId"])
    .index("by_createdAt", ["createdAt"]),

  // Documents table
  documents: defineTable({
    filename: v.string(),
    originalFilename: v.string(),
    filePath: v.string(),
    boxFileId: v.optional(v.string()),
    fileSize: v.number(),
    mimeType: v.optional(v.string()),
    fileHash: v.optional(v.string()),
    
    // Deal association
    dealId: v.optional(v.id("deals")),
    
    // Classification
    documentType: v.optional(v.string()),
    ddCode: v.optional(v.string()),
    category: v.optional(v.string()),
    classificationConfidence: v.optional(v.number()),
    
    // Processing status
    status: v.union(
      v.literal("PENDING"),
      v.literal("PROCESSING"), 
      v.literal("COMPLETED"),
      v.literal("FAILED")
    ),
    processingStage: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    
    // Agent assignment
    assignedAgentId: v.optional(v.string()),
    agentType: v.optional(v.string()),
    
    // Metadata
    metadata: v.optional(v.any()),
    
    // Timestamps
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_ddCode", ["ddCode"])
    .index("by_boxFileId", ["boxFileId"])
    .index("by_assignedAgent", ["assignedAgentId"])
    .index("by_dealId", ["dealId"]),

  // Processing jobs and results
  processingJobs: defineTable({
    documentId: v.id("documents"),
    
    // Job configuration
    jobType: v.string(),
    priority: v.number(),
    agentType: v.optional(v.string()),
    llmProvider: v.string(),
    llmModel: v.string(),
    
    // Resource usage
    estimatedTokens: v.optional(v.number()),
    actualTokens: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    
    // Timing
    queuedAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    processingTimeMs: v.optional(v.number()),
    
    // Status and results
    status: v.union(
      v.literal("QUEUED"),
      v.literal("PROCESSING"),
      v.literal("COMPLETED"),
      v.literal("FAILED")
    ),
    resultData: v.optional(v.any()),
    errorDetails: v.optional(v.string()),
    retryCount: v.number(),
    
    // Agent tracking
    agentId: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_documentId", ["documentId"])
    .index("by_agentId", ["agentId"]),

  // Agent pool management
  agents: defineTable({
    agentId: v.string(),
    agentType: v.union(
      v.literal("synthesis"),
      v.literal("midnight-atlas"),
      v.literal("dd-framework")
    ),
    status: v.union(
      v.literal("WARM"),
      v.literal("PROCESSING"),
      v.literal("SCALING_UP"),
      v.literal("SCALING_DOWN"),
      v.literal("ERROR")
    ),
    
    // Context and configuration
    contextLoaded: v.boolean(),
    contextSize: v.optional(v.number()),
    contextCost: v.optional(v.number()),
    
    // Current assignment
    currentDocumentId: v.optional(v.id("documents")),
    currentJobId: v.optional(v.id("processingJobs")),
    
    // Performance metrics
    documentsProcessed: v.number(),
    totalTokensUsed: v.number(),
    totalCost: v.number(),
    averageProcessingTime: v.optional(v.number()),
    
    // Lifecycle
    createdAt: v.number(),
    lastActiveAt: v.number(),
    scheduledForShutdown: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_agentType", ["agentType"])
    .index("by_lastActive", ["lastActiveAt"]),

  // Cost tracking and analytics
  costTracking: defineTable({
    // References
    jobId: v.optional(v.id("processingJobs")),
    documentId: v.optional(v.id("documents")),
    agentId: v.optional(v.string()),
    
    // Provider details
    provider: v.string(),
    model: v.string(),
    
    // Usage metrics
    inputTokens: v.number(),
    outputTokens: v.number(),
    totalTokens: v.number(),
    costPerToken: v.number(),
    totalCost: v.number(),
    
    // Context costs
    contextTokens: v.optional(v.number()),
    contextCost: v.optional(v.number()),
    
    // Timing
    processingDate: v.string(), // YYYY-MM-DD format
    timestamp: v.number(),
  })
    .index("by_processingDate", ["processingDate"])
    .index("by_provider", ["provider"])
    .index("by_documentId", ["documentId"])
    .index("by_agentId", ["agentId"]),

  // Real-time metrics for dashboard
  realtimeMetrics: defineTable({
    metricType: v.union(
      v.literal("PROCESSING_STATS"),
      v.literal("COST_STATS"),
      v.literal("AGENT_STATS"),
      v.literal("QUEUE_STATS")
    ),
    
    // Metrics data
    data: v.any(),
    
    // Metadata
    timestamp: v.number(),
    validUntil: v.optional(v.number()),
  })
    .index("by_metricType", ["metricType"])
    .index("by_timestamp", ["timestamp"]),

  // Fireflies.ai pending transcript approvals
  firefliesPending: defineTable({
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
    
    // Processing status
    status: v.union(
      v.literal("pending_approval"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    
    // Assignment
    suggestedDealId: v.optional(v.id("deals")),
    assignedDealId: v.optional(v.id("deals")),
    
    // Timestamps
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_transcriptId", ["transcriptId"])
    .index("by_createdAt", ["createdAt"]),

  // Notification history
  notifications: defineTable({
    type: v.union(
      v.literal("PROCESSING_STARTED"),
      v.literal("PROCESSING_COMPLETED"), 
      v.literal("PROCESSING_FAILED"),
      v.literal("COST_ALERT"),
      v.literal("DAILY_SUMMARY")
    ),
    
    // Notification content
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    
    // Delivery channels
    channels: v.array(v.union(
      v.literal("slack"),
      v.literal("email"),
      v.literal("webhook")
    )),
    
    // Status tracking
    status: v.union(
      v.literal("PENDING"),
      v.literal("SENT"),
      v.literal("FAILED")
    ),
    
    // References
    documentId: v.optional(v.id("documents")),
    jobId: v.optional(v.id("processingJobs")),
    
    // Timing
    createdAt: v.number(),
    sentAt: v.optional(v.number()),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),
});