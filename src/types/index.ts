import { Id } from "../../convex/_generated/dataModel";

// Document processing types
export interface Document {
  _id: Id<"documents">;
  filename: string;
  originalFilename: string;
  filePath: string;
  boxFileId?: string;
  fileSize: number;
  mimeType?: string;
  fileHash?: string;
  
  // Classification
  documentType?: string;
  ddCode?: string;
  category?: string;
  classificationConfidence?: number;
  
  // Processing status
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  processingStage?: string;
  errorMessage?: string;
  
  // Agent assignment
  assignedAgentId?: string;
  agentType?: string;
  
  // Metadata
  metadata?: any;
  
  // Timestamps
  createdAt: number;
  processedAt?: number;
}

// Processing job types
export interface ProcessingJob {
  _id: Id<"processingJobs">;
  documentId: Id<"documents">;
  
  // Job configuration
  jobType: string;
  priority: number;
  agentType?: string;
  llmProvider: string;
  llmModel: string;
  
  // Resource usage
  estimatedTokens?: number;
  actualTokens?: number;
  estimatedCost?: number;
  actualCost?: number;
  
  // Timing
  queuedAt: number;
  startedAt?: number;
  completedAt?: number;
  processingTimeMs?: number;
  
  // Status and results
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  resultData?: any;
  errorDetails?: string;
  retryCount: number;
  
  // Agent tracking
  agentId?: string;
}

// Agent types
export interface Agent {
  _id: Id<"agents">;
  agentId: string;
  agentType: "synthesis" | "midnight-atlas" | "dd-framework";
  status: "WARM" | "PROCESSING" | "SCALING_UP" | "SCALING_DOWN" | "ERROR";
  
  // Context and configuration
  contextLoaded: boolean;
  contextSize?: number;
  contextCost?: number;
  
  // Current assignment
  currentDocumentId?: Id<"documents">;
  currentJobId?: Id<"processingJobs">;
  
  // Performance metrics
  documentsProcessed: number;
  totalTokensUsed: number;
  totalCost: number;
  averageProcessingTime?: number;
  
  // Lifecycle
  createdAt: number;
  lastActiveAt: number;
  scheduledForShutdown?: number;
}

// LLM model configuration
export interface LLMModelConfig {
  id: string;
  name: string;
  description: string;
  provider: "anthropic" | "openai" | "google";
  costPer1KTokens: {
    input: number;
    output: number;
  };
  maxTokens: number;
  speed: "Very Fast" | "Fast" | "Medium" | "Slow";
  quality: "Good" | "Excellent" | "Premium";
}

// Available Claude models
export const CLAUDE_MODELS: LLMModelConfig[] = [
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    description: "Fastest & cheapest - Good for basic processing",
    provider: "anthropic",
    costPer1KTokens: { input: 0.25, output: 1.25 },
    maxTokens: 200000,
    speed: "Very Fast",
    quality: "Good"
  },
  {
    id: "claude-3-5-sonnet-20241022", 
    name: "Claude 3.5 Sonnet",
    description: "Balanced speed & quality - Recommended",
    provider: "anthropic",
    costPer1KTokens: { input: 3, output: 15 },
    maxTokens: 200000,
    speed: "Fast",
    quality: "Excellent"
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    description: "Highest quality - Best for complex analysis",
    provider: "anthropic",
    costPer1KTokens: { input: 15, output: 75 },
    maxTokens: 200000,
    speed: "Medium",
    quality: "Premium"
  }
];

// Real-time metrics
export interface ProcessingMetrics {
  current: {
    tokensUsed: number;
    costAccrued: number;
    documentsProcessing: number;
    documentsCompleted: number;
    documentsFailed: number;
    queueDepth: number;
    activeAgents: number;
  };
  
  rates: {
    tokensPerSecond: number;
    costPerSecond: number;
    documentsPerHour: number;
  };
  
  projections: {
    dailyCostEstimate: number;
    completionETA: Date | null;
    budgetExhaustionETA: Date | null;
  };
}

// Agent pool configuration
export interface AgentPoolConfig {
  scaling: {
    minAgents: number;
    maxAgents: number;
    scaleUpThreshold: number;
    scaleDownDelay: number;
  };
  
  costControls: {
    dailyAgentBudget: number;
    maxConcurrentCost: number;
  };
}

// Notification types
export interface SlackNotification {
  type: "PROCESSING_STARTED" | "PROCESSING_COMPLETED" | "PROCESSING_FAILED" | "COST_ALERT" | "DAILY_SUMMARY";
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  dashboardUrl?: string;
}

// Box.com webhook types
export interface BoxWebhookEvent {
  trigger: "FILE.UPLOADED" | "FILE.COPIED" | "FILE.MOVED" | "FILE.DOWNLOADED";
  source: {
    id: string;
    name: string;
    type: "file" | "folder";
    parent?: {
      id: string;
      name: string;
    };
  };
  created_at: string;
  event_id: string;
}

// Document classification
export interface ClassificationResult {
  documentType: string;
  confidence: number;
  ddCode: string;
  category: string;
  suggestedAgent: "synthesis" | "midnight-atlas" | "dd-framework";
  metadata: {
    keywords: string[];
    patterns: string[];
    alternativeTypes: { type: string; confidence: number }[];
  };
}

// OKOA agent context
export interface OKOAAgentContext {
  ddFramework: string;
  synthesisAgent: string;
  midnightAtlas: string;
  visualLibrary: string;
  totalTokens: number;
  estimatedCost: number;
}

// Error types
export interface ProcessingError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  timestamp: number;
}