/**
 * Security validation utilities for OKOA system
 * Handles input sanitization and security checks
 */

import { z } from 'zod';
import createDOMPurify from 'isomorphic-dompurify';

const DOMPurify = createDOMPurify();

// Financial data validation schema
export const FinancialDataSchema = z.object({
  totalValue: z.number().min(0).max(10000000000), // Max $10B
  keyCount: z.number().int().min(1).max(10000),
  totalBudget: z.number().min(0).max(10000000000),
  spentAmount: z.number().min(0),
  projectedValue: z.number().min(0).max(10000000000),
  timeHorizon: z.number().min(0.1).max(50), // Years
});

// Deal data validation
export const DealDataSchema = z.object({
  name: z.string().min(1).max(200).regex(/^[a-zA-Z0-9\s\-_.()]+$/, 'Invalid characters in deal name'),
  description: z.string().max(5000).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'completed']),
  clientName: z.string().min(1).max(200),
});

// Chat message validation
export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  dealId: z.string().uuid('Invalid deal ID format'),
});

/**
 * Sanitize user input to prevent XSS and injection attacks
 * @param input - Raw user input
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [], 
    ALLOW_DATA_ATTR: false 
  }).trim();
}

/**
 * Validate and sanitize financial calculations input
 * @param data - Financial data to validate
 * @returns Validated and sanitized data
 */
export function validateFinancialData(data: unknown) {
  const result = FinancialDataSchema.safeParse(data);
  
  if (!result.success) {
    throw new Error(`Financial data validation failed: ${result.error.message}`);
  }
  
  // Additional business logic validation
  if (result.data.spentAmount > result.data.totalBudget) {
    console.warn('Spent amount exceeds total budget - possible over-budget situation');
  }
  
  if (result.data.projectedValue < result.data.totalValue) {
    console.warn('Projected value is less than current value - negative projection');
  }
  
  return result.data;
}

/**
 * Rate limiting tracker for API endpoints
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  /**
   * Check if request is within rate limits
   * @param identifier - Client identifier (IP, user ID, etc.)
   * @returns true if within limits, false if rate limited
   */
  checkLimit(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the time window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false; // Rate limited
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  /**
   * Get remaining requests for identifier
   */
  getRemainingRequests(identifier: string): number {
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => Date.now() - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}