import { POST } from '../deals/[id]/chat/route'
import { NextRequest } from 'next/server'
import fs from 'fs'

// Mock ConvexHttpClient
const mockConvexClient = {
  query: jest.fn(),
  mutation: jest.fn(),
}

jest.mock('convex/browser', () => ({
  ConvexHttpClient: jest.fn(() => mockConvexClient),
}))

// Mock ClaudeProvider
const mockClaudeProvider = {
  generateResponse: jest.fn(),
}

jest.mock('../../../lib/llm/providers/claude', () => ({
  ClaudeProvider: jest.fn(() => mockClaudeProvider),
}))

// Mock fs
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-convex.convex.cloud'
process.env.ANTHROPIC_API_KEY = 'test-key'

describe('/api/deals/[id]/chat API Route', () => {
  const mockFolder = {
    _id: 'test-folder-id',
    name: 'Test Deal',
    status: 'ACTIVE',
  }

  const mockDocuments = [
    { 
      _id: '1', 
      name: 'contract.pdf',
      filename: 'contract.pdf', 
      type: 'original',
      content: 'Contract content...'
    },
    { 
      _id: '2', 
      name: 'master_SYNTHDOC.txt',
      filename: 'master_SYNTHDOC.txt', 
      type: 'synthdoc',
      content: 'Synthesis document content...'
    },
  ]

  const mockAIResponse = {
    content: 'This is an AI analysis of the deal...',
    usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
    cost: 0.01,
    processingTime: 2000,
    model: 'claude-3-5-sonnet-latest',
    provider: 'anthropic' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock agent config file
    ;(fs.readFileSync as jest.Mock).mockReturnValue('Mock agent config')
    
    mockConvexClient.query
      .mockResolvedValueOnce(mockFolder) // folders.getFolder
      .mockResolvedValueOnce(mockDocuments) // documents.listByFolder
    
    mockConvexClient.mutation.mockResolvedValueOnce('chat-document-id')
    
    mockClaudeProvider.generateResponse.mockResolvedValueOnce(mockAIResponse)
  })

  it('processes chat message successfully', async () => {
    const requestBody = {
      message: 'What are the key risks in this deal?',
      context: { documents: mockDocuments }
    }

    const request = new NextRequest('http://localhost/api/deals/test-id/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    })
    const params = Promise.resolve({ id: 'test-id' })
    
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.response).toBe('This is an AI analysis of the deal...')
    expect(data.agent).toBe('MIDNIGHT_ATLAS_PRISM_v1.1')
    expect(data.timestamp).toBeDefined()
  })

  it('loads agent configuration file', async () => {
    const requestBody = {
      message: 'Test message',
      context: null
    }

    const request = new NextRequest('http://localhost/api/deals/test-id/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })
    const params = Promise.resolve({ id: 'test-id' })
    
    await POST(request, { params })

    expect(fs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('MIDNIGHT_ATLAS_PRISM_v1.1_RE_EDITION.yaml'),
      'utf-8'
    )
  })

  it('includes document context in system prompt', async () => {
    const requestBody = {
      message: 'Analyze the documents',
      context: { documents: mockDocuments }
    }

    const request = new NextRequest('http://localhost/api/deals/test-id/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })
    const params = Promise.resolve({ id: 'test-id' })
    
    await POST(request, { params })

    expect(mockClaudeProvider.generateResponse).toHaveBeenCalledWith({
      systemPrompt: expect.stringContaining('CURRENT DEAL CONTEXT'),
      userPrompt: 'Analyze the documents',
      maxTokens: 4000,
      temperature: 0.7,
    })

    const systemPrompt = mockClaudeProvider.generateResponse.mock.calls[0][0].systemPrompt
    expect(systemPrompt).toContain('Test Deal')
    expect(systemPrompt).toContain('contract.pdf')
    expect(systemPrompt).toContain('master_SYNTHDOC.txt')
    expect(systemPrompt).toContain('Synthesis document content')
  })

  it('handles Wolfgramm deals specially', async () => {
    const wolfgrammFolder = {
      ...mockFolder,
      name: 'Wolfgramm Ascent Waldorf Deal'
    }

    mockConvexClient.query
      .mockReset()
      .mockResolvedValueOnce(wolfgrammFolder)
      .mockResolvedValueOnce(mockDocuments)

    // Mock Wolfgramm document file
    ;(fs.readFileSync as jest.Mock)
      .mockReturnValueOnce('Mock agent config') // Agent config
      .mockReturnValueOnce('Wolfgramm deal data...') // Wolfgramm document

    const requestBody = {
      message: 'Tell me about this Wolfgramm deal',
      context: null
    }

    const request = new NextRequest('http://localhost/api/deals/wolfgramm-id/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })
    const params = Promise.resolve({ id: 'wolfgramm-id' })
    
    await POST(request, { params })

    const systemPrompt = mockClaudeProvider.generateResponse.mock.calls[0][0].systemPrompt
    expect(systemPrompt).toContain('WOLFGRAMM ASCENT WALDORF DEAL CONTEXT')
    expect(systemPrompt).toContain('Wolfgramm deal data')
  })

  it('saves chat interaction to database', async () => {
    const requestBody = {
      message: 'Test message',
      context: null
    }

    const request = new NextRequest('http://localhost/api/deals/test-id/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })
    const params = Promise.resolve({ id: 'test-id' })
    
    await POST(request, { params })

    expect(mockConvexClient.mutation).toHaveBeenCalledWith(
      expect.any(Object), // api.documents.createDocument
      {
        folderId: 'test-id',
        name: expect.stringMatching(/^Chat_\d+$/),
        type: 'chat',
        content: JSON.stringify({
          user_message: 'Test message',
          ai_response: 'This is an AI analysis of the deal...',
          timestamp: expect.any(Number),
          agent: 'MIDNIGHT_ATLAS_PRISM_v1.1'
        }),
        status: 'completed'
      }
    )
  })

  it('returns 404 when deal not found', async () => {
    mockConvexClient.query
      .mockReset()
      .mockResolvedValueOnce(null) // folder not found

    const requestBody = {
      message: 'Test message',
      context: null
    }

    const request = new NextRequest('http://localhost/api/deals/nonexistent/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })
    const params = Promise.resolve({ id: 'nonexistent' })
    
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Deal not found')
  })

  it('handles AI provider errors', async () => {
    mockClaudeProvider.generateResponse.mockRejectedValueOnce(
      new Error('Claude API error')
    )

    const requestBody = {
      message: 'Test message',
      context: null
    }

    const request = new NextRequest('http://localhost/api/deals/test-id/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })
    const params = Promise.resolve({ id: 'test-id' })
    
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to process chat message')
  })

  it('handles missing agent config file gracefully', async () => {
    ;(fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error('File not found')
    })

    const requestBody = {
      message: 'Test message',
      context: null
    }

    const request = new NextRequest('http://localhost/api/deals/test-id/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })
    const params = Promise.resolve({ id: 'test-id' })
    
    const response = await POST(request, { params })

    expect(response.status).toBe(500)
  })

  it('handles malformed request body', async () => {
    const request = new NextRequest('http://localhost/api/deals/test-id/chat', {
      method: 'POST',
      body: 'invalid json',
      headers: { 'Content-Type': 'application/json' }
    })
    const params = Promise.resolve({ id: 'test-id' })
    
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to process chat message')
  })
})