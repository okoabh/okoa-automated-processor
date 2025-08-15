import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODELS, type LLMModelConfig } from '../../../types';

export class ClaudeProvider {
  private client: Anthropic;
  
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  
  async processDocument(
    content: string,
    agentPrompt: string,
    model: string = process.env.DEFAULT_CLAUDE_MODEL || 'claude-3-5-sonnet-latest'
  ) {
    const startTime = Date.now();
    
    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: 4000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: `${agentPrompt}\n\n---\n\nDocument to process:\n${content}`,
          },
        ],
      });
      
      const processingTime = Date.now() - startTime;
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const totalTokens = inputTokens + outputTokens;
      
      // Calculate cost based on model
      const modelConfig = CLAUDE_MODELS.find(m => m.id === model);
      const cost = modelConfig 
        ? (inputTokens * modelConfig.costPer1KTokens.input + outputTokens * modelConfig.costPer1KTokens.output) / 1000
        : 0;
      
      return {
        content: response.content[0].type === 'text' ? response.content[0].text : '',
        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
        },
        cost,
        processingTime,
        model,
        provider: 'anthropic' as const,
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Claude processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async processWithAgent(
    documentContent: string,
    agentContext: string,
    documentType: string = 'general',
    model?: string
  ) {
    // Select model based on document type if not specified
    if (!model) {
      model = this.selectModelForDocumentType(documentType);
    }
    
    const agentPrompt = this.buildAgentPrompt(agentContext, documentType);
    
    return await this.processDocument(documentContent, agentPrompt, model);
  }
  
  private selectModelForDocumentType(documentType: string): string {
    const modelSelection: Record<string, string> = {
      'real-estate': 'claude-3-5-sonnet-latest', // Complex analysis
      'financial': 'claude-3-5-sonnet-latest',   // Mathematical reasoning
      'legal': 'claude-3-5-sonnet-latest',       // Detailed analysis
      'simple': 'claude-3-5-haiku-20241022',       // Basic documents
      'general': 'claude-3-5-sonnet-latest',     // Default
    };
    
    return modelSelection[documentType] || 'claude-3-5-sonnet-latest';
  }
  
  private buildAgentPrompt(agentContext: string, documentType: string): string {
    const basePrompt = `${agentContext}\n\nYou are processing a ${documentType} document. Follow the OKOA standards exactly.`;
    
    const typeSpecificInstructions: Record<string, string> = {
      'real-estate': 'Pay special attention to property details, legal descriptions, financial terms, and risk factors.',
      'financial': 'Focus on numerical accuracy, financial ratios, cash flows, and compliance requirements.',
      'legal': 'Examine contract terms, obligations, deadlines, and legal risks carefully.',
      'general': 'Extract all relevant business information while maintaining OKOA formatting standards.',
    };
    
    const instruction = typeSpecificInstructions[documentType] || typeSpecificInstructions.general;
    
    return `${basePrompt}\n\n${instruction}`;
  }
  
  async estimateTokens(content: string, agentContext: string): Promise<number> {
    // Rough estimation: ~4 characters per token
    const totalContent = content + agentContext;
    return Math.ceil(totalContent.length / 4);
  }
  
  async estimateCost(
    content: string,
    agentContext: string,
    model: string = 'claude-3-5-sonnet-latest'
  ): Promise<number> {
    const estimatedTokens = await this.estimateTokens(content, agentContext);
    const modelConfig = CLAUDE_MODELS.find(m => m.id === model);
    
    if (!modelConfig) {
      throw new Error(`Unknown model: ${model}`);
    }
    
    // Estimate input vs output tokens (roughly 80% input, 20% output)
    const inputTokens = Math.ceil(estimatedTokens * 0.8);
    const outputTokens = Math.ceil(estimatedTokens * 0.2);
    
    return (inputTokens * modelConfig.costPer1KTokens.input + outputTokens * modelConfig.costPer1KTokens.output) / 1000;
  }
  
  getAvailableModels(): LLMModelConfig[] {
    return CLAUDE_MODELS;
  }
  
  async generateResponse(options: {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }) {
    const model = options.model || 'claude-3-5-sonnet-latest';
    const startTime = Date.now();
    
    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        system: options.systemPrompt,
        messages: [
          {
            role: 'user',
            content: options.userPrompt,
          },
        ],
      });
      
      const processingTime = Date.now() - startTime;
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const totalTokens = inputTokens + outputTokens;
      
      // Calculate cost based on model
      const modelConfig = CLAUDE_MODELS.find(m => m.id === model);
      const cost = modelConfig 
        ? (inputTokens * modelConfig.costPer1KTokens.input + outputTokens * modelConfig.costPer1KTokens.output) / 1000
        : 0;
      
      return {
        content: response.content[0].type === 'text' ? response.content[0].text : '',
        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
        },
        cost,
        processingTime,
        model,
        provider: 'anthropic' as const,
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Claude processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkAvailability(): Promise<boolean> {
    try {
      // Simple test request to verify API availability
      await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch (error) {
      console.error('Claude availability check failed:', error);
      return false;
    }
  }
}