import { ClaudeProvider } from '../llm/providers/claude'
import Anthropic from '@anthropic-ai/sdk'

// Mock Anthropic SDK
const mockCreate = jest.fn()
const mockAnthropic = {
  messages: {
    create: mockCreate
  }
}

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn(() => mockAnthropic)
})

// Mock CLAUDE_MODELS from types
jest.mock('../../types', () => ({
  CLAUDE_MODELS: [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      costPer1KTokens: { input: 0.003, output: 0.015 },
      maxTokens: 200000
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      costPer1KTokens: { input: 0.0008, output: 0.004 },
      maxTokens: 200000
    }
  ]
}))

describe('ClaudeProvider', () => {
  let provider: ClaudeProvider
  
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-api-key'
    provider = new ClaudeProvider()
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
  })

  describe('constructor', () => {
    it('throws error when API key is missing', () => {
      delete process.env.ANTHROPIC_API_KEY
      
      expect(() => new ClaudeProvider()).toThrow(
        'ANTHROPIC_API_KEY environment variable is required'
      )
    })

    it('initializes Anthropic client when API key is present', () => {
      expect(() => new ClaudeProvider()).not.toThrow()
      expect(Anthropic).toHaveBeenCalledWith({
        apiKey: 'test-api-key'
      })
    })
  })

  describe('generateResponse', () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'This is a test response' }],
      usage: {
        input_tokens: 100,
        output_tokens: 50
      }
    }

    beforeEach(() => {
      mockCreate.mockResolvedValue(mockResponse)
    })

    it('generates response successfully', async () => {
      const result = await provider.generateResponse({
        systemPrompt: 'You are a helpful assistant',
        userPrompt: 'Hello, how are you?',
        maxTokens: 1000,
        temperature: 0.7
      })

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        system: 'You are a helpful assistant',
        messages: [
          {
            role: 'user',
            content: 'Hello, how are you?'
          }
        ]
      })

      expect(result).toMatchObject({
        content: 'This is a test response',
        usage: {
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150
        },
        cost: expect.any(Number),
        processingTime: expect.any(Number),
        model: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic'
      })
    })

    it('uses custom model when specified', async () => {
      await provider.generateResponse({
        systemPrompt: 'Test prompt',
        userPrompt: 'Test message',
        model: 'claude-3-5-haiku-20241022'
      })

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-haiku-20241022'
        })
      )
    })

    it('calculates cost correctly', async () => {
      const result = await provider.generateResponse({
        systemPrompt: 'Test prompt',
        userPrompt: 'Test message'
      })

      // Expected cost: (100 * 0.003 + 50 * 0.015) / 1000 = 0.001050
      expect(result.cost).toBeCloseTo(0.001050, 6)
    })

    it('handles API errors', async () => {
      const error = new Error('API rate limit exceeded')
      mockCreate.mockRejectedValue(error)

      await expect(
        provider.generateResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test'
        })
      ).rejects.toThrow('Claude processing failed: API rate limit exceeded')
    })

    it('uses default values for optional parameters', async () => {
      await provider.generateResponse({
        systemPrompt: 'Test',
        userPrompt: 'Test'
      })

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 4000,
          temperature: 0.7,
          model: 'claude-3-5-sonnet-20241022'
        })
      )
    })
  })

  describe('processDocument', () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'Document processed successfully' }],
      usage: { input_tokens: 200, output_tokens: 100 }
    }

    beforeEach(() => {
      mockCreate.mockResolvedValue(mockResponse)
    })

    it('processes document with agent prompt', async () => {
      const result = await provider.processDocument(
        'Document content here',
        'Process this document carefully'
      )

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.1,
        messages: [{
          role: 'user',
          content: expect.stringContaining('Process this document carefully')
        }]
      })

      expect(result.content).toBe('Document processed successfully')
    })
  })

  describe('processWithAgent', () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'Agent processed document' }],
      usage: { input_tokens: 150, output_tokens: 75 }
    }

    beforeEach(() => {
      mockCreate.mockResolvedValue(mockResponse)
    })

    it('selects appropriate model for document type', async () => {
      await provider.processWithAgent(
        'Real estate document',
        'Agent context',
        'real-estate'
      )

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-sonnet-20241022'
        })
      )
    })

    it('uses simple model for basic documents', async () => {
      await provider.processWithAgent(
        'Simple document',
        'Agent context',
        'simple'
      )

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-haiku-20241022'
        })
      )
    })
  })

  describe('checkAvailability', () => {
    it('returns true when API is available', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'test' }],
        usage: { input_tokens: 1, output_tokens: 1 }
      })

      const result = await provider.checkAvailability()
      expect(result).toBe(true)
    })

    it('returns false when API is unavailable', async () => {
      mockCreate.mockRejectedValue(new Error('Service unavailable'))

      const result = await provider.checkAvailability()
      expect(result).toBe(false)
    })
  })

  describe('estimateTokens', () => {
    it('estimates tokens correctly', async () => {
      const content = 'This is a test content'
      const agentContext = 'Agent context here'
      
      const tokens = await provider.estimateTokens(content, agentContext)
      
      // Rough estimation: ~4 characters per token
      const expectedTokens = Math.ceil((content.length + agentContext.length) / 4)
      expect(tokens).toBe(expectedTokens)
    })
  })

  describe('estimateCost', () => {
    it('estimates cost correctly', async () => {
      const cost = await provider.estimateCost(
        'Test content',
        'Agent context',
        'claude-3-5-sonnet-20241022'
      )

      expect(cost).toBeGreaterThan(0)
      expect(typeof cost).toBe('number')
    })

    it('throws error for unknown model', async () => {
      await expect(
        provider.estimateCost('Test', 'Context', 'unknown-model')
      ).rejects.toThrow('Unknown model: unknown-model')
    })
  })
})