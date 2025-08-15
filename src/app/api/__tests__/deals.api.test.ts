import { GET, POST } from '../deals/[id]/route'
import { NextRequest } from 'next/server'

// Mock ConvexHttpClient
const mockConvexClient = {
  query: jest.fn(),
  mutation: jest.fn(),
}

jest.mock('convex/browser', () => ({
  ConvexHttpClient: jest.fn(() => mockConvexClient),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-convex.convex.cloud'

describe('/api/deals/[id] API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/deals/[id]', () => {
    const mockFolder = {
      _id: 'test-folder-id',
      name: 'Test Deal',
      status: 'ACTIVE',
      createdAt: Date.now(),
      documentCount: 3
    }

    const mockDocuments = [
      { _id: '1', filename: 'contract.pdf', category: 'original', status: 'COMPLETED' },
      { _id: '2', filename: 'contract_OCR.txt', category: 'ocr', status: 'COMPLETED' },
      { _id: '3', filename: 'master_SYNTHDOC.txt', category: 'synthdoc', status: 'COMPLETED' },
    ]

    it('returns deal data successfully', async () => {
      mockConvexClient.query
        .mockResolvedValueOnce(mockFolder) // folders.getFolder
        .mockResolvedValueOnce(mockDocuments) // documents.listByFolder

      const request = new NextRequest('http://localhost/api/deals/test-id')
      const params = Promise.resolve({ id: 'test-id' })
      
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.folder).toEqual(mockFolder)
      expect(data.totalDocuments).toBe(3)
      expect(data.documents).toHaveProperty('original')
      expect(data.documents).toHaveProperty('ocr')
      expect(data.documents).toHaveProperty('synthdoc')
    })

    it('categorizes documents correctly by filename', async () => {
      const documents = [
        { _id: '1', filename: 'project.pdf', originalFilename: 'project.pdf' },
        { _id: '2', filename: 'project_OCR.txt', originalFilename: 'project_OCR.txt' },
        { _id: '3', filename: 'summary_Extract.txt', originalFilename: 'summary_Extract.txt' },
        { _id: '4', filename: 'analysis_Summary.md', originalFilename: 'analysis_Summary.md' },
        { _id: '5', filename: 'master_SYNTHDOC.txt', originalFilename: 'master_SYNTHDOC.txt' },
      ]

      mockConvexClient.query
        .mockResolvedValueOnce(mockFolder)
        .mockResolvedValueOnce(documents)

      const request = new NextRequest('http://localhost/api/deals/test-id')
      const params = Promise.resolve({ id: 'test-id' })
      
      const response = await GET(request, { params })
      const data = await response.json()

      expect(data.documents.original).toHaveLength(1)
      expect(data.documents.ocr).toHaveLength(1)
      expect(data.documents.plaintext).toHaveLength(1)
      expect(data.documents.synthetic).toHaveLength(1)
      expect(data.documents.synthdoc).toHaveLength(1)
    })

    it('returns 404 when folder not found', async () => {
      mockConvexClient.query.mockResolvedValueOnce(null) // folders.getFolder returns null

      const request = new NextRequest('http://localhost/api/deals/nonexistent-id')
      const params = Promise.resolve({ id: 'nonexistent-id' })
      
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Folder not found')
    })

    it('handles database errors', async () => {
      mockConvexClient.query.mockRejectedValueOnce(new Error('Database error'))

      const request = new NextRequest('http://localhost/api/deals/test-id')
      const params = Promise.resolve({ id: 'test-id' })
      
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch deal data')
    })
  })

  describe('POST /api/deals/[id]', () => {
    it('organizes documents successfully', async () => {
      const mockDocumentId = 'new-document-id'
      mockConvexClient.mutation.mockResolvedValueOnce(mockDocumentId)

      const requestBody = {
        action: 'organize_document',
        documentPath: '/uploads/test-document.pdf',
        documentType: 'original'
      }

      const request = new NextRequest('http://localhost/api/deals/test-id', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })
      const params = Promise.resolve({ id: 'test-id' })
      
      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.document).toBe(mockDocumentId)
      
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(
        expect.any(Object), // api.documents.createDocument
        {
          folderId: 'test-id',
          name: 'test-document.pdf',
          type: 'original',
          path: '/uploads/test-document.pdf',
          status: 'organized',
          metadata: {
            organizedAt: expect.any(Number),
            category: 'original'
          }
        }
      )
    })

    it('returns 400 for invalid action', async () => {
      const requestBody = {
        action: 'invalid_action',
        documentPath: '/uploads/test.pdf',
        documentType: 'original'
      }

      const request = new NextRequest('http://localhost/api/deals/test-id', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })
      const params = Promise.resolve({ id: 'test-id' })
      
      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid action')
    })

    it('handles database errors during document creation', async () => {
      mockConvexClient.mutation.mockRejectedValueOnce(new Error('Database error'))

      const requestBody = {
        action: 'organize_document',
        documentPath: '/uploads/test.pdf',
        documentType: 'original'
      }

      const request = new NextRequest('http://localhost/api/deals/test-id', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      })
      const params = Promise.resolve({ id: 'test-id' })
      
      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to update deal')
    })
  })
})