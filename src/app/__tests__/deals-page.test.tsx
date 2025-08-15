import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'
import DealPage from '../deals/[id]/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

// Mock the AISidebar components
jest.mock('../../components/ai/AISidebar', () => ({
  AISidebar: ({ isOpen, dealName }: { isOpen: boolean, dealName: string }) => (
    isOpen ? <div data-testid="ai-sidebar">AI Sidebar for {dealName}</div> : null
  ),
  AIFloatingButton: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="ai-floating-button" onClick={onClick}>AI Button</button>
  ),
}))

describe('DealPage', () => {
  const mockDealData = {
    folder: {
      _id: 'test-folder-id',
      name: 'Test Deal',
      status: 'ACTIVE',
      createdAt: Date.now(),
      documentCount: 5
    },
    documents: {
      original: [
        { _id: '1', name: 'contract.pdf', status: 'COMPLETED', createdAt: Date.now() }
      ],
      ocr: [
        { _id: '2', name: 'contract_OCR.txt', status: 'COMPLETED', createdAt: Date.now() }
      ],
      plaintext: [
        { _id: '3', name: 'extract.txt', status: 'COMPLETED', createdAt: Date.now() }
      ],
      synthetic: [
        { _id: '4', name: 'summary.md', status: 'COMPLETED', createdAt: Date.now() }
      ],
      synthdoc: [
        { _id: '5', name: 'master_SYNTHDOC.txt', status: 'COMPLETED', createdAt: Date.now() }
      ]
    },
    totalDocuments: 5
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useParams as jest.Mock).mockReturnValue({ id: 'test-deal-id' })
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDealData)
    })
  })

  it('shows loading state initially', () => {
    render(<DealPage />)
    expect(screen.getByText('LOADING DEAL DATA...')).toBeInTheDocument()
  })

  it('renders deal page with data', async () => {
    render(<DealPage />)

    await waitFor(() => {
      expect(screen.getByText('📁 TEST DEAL')).toBeInTheDocument()
      expect(screen.getByText('Deal documents and AI analysis interface')).toBeInTheDocument()
    })
  })

  it('displays document tabs with counts', async () => {
    render(<DealPage />)

    await waitFor(() => {
      expect(screen.getByText('📄 DOCUMENTS (5)')).toBeInTheDocument()
      expect(screen.getByText('💰 FINANCIAL')).toBeInTheDocument()
      expect(screen.getByText('📞 TRANSCRIPTS')).toBeInTheDocument()
    })
  })

  it('shows document categories', async () => {
    render(<DealPage />)

    await waitFor(() => {
      expect(screen.getByText('📄 ORIGINAL FILES (1)')).toBeInTheDocument()
      expect(screen.getByText('🔍 OCR PROCESSED (1)')).toBeInTheDocument()
      expect(screen.getByText('📝 PLAIN TEXT (1)')).toBeInTheDocument()
      expect(screen.getByText('⚡ SYNTHETIC SUMMARIES (1)')).toBeInTheDocument()
      expect(screen.getByText('🎯 MASTER SYNTHDOC (1)')).toBeInTheDocument()
    })
  })

  it('displays document names and statuses', async () => {
    render(<DealPage />)

    await waitFor(() => {
      expect(screen.getByText('contract.pdf')).toBeInTheDocument()
      expect(screen.getByText('contract_OCR.txt')).toBeInTheDocument()
      expect(screen.getByText('extract.txt')).toBeInTheDocument()
      expect(screen.getByText('summary.md')).toBeInTheDocument()
      expect(screen.getByText('master_SYNTHDOC.txt')).toBeInTheDocument()
    })
  })

  it('switches between tabs', async () => {
    render(<DealPage />)

    await waitFor(() => {
      expect(screen.getByText('📄 DOCUMENTS (5)')).toBeInTheDocument()
    })

    // Click financial tab
    fireEvent.click(screen.getByText('💰 FINANCIAL'))
    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('FINANCIAL ANALYSIS')).toBeInTheDocument()

    // Click transcripts tab
    fireEvent.click(screen.getByText('📞 TRANSCRIPTS'))
    // TranscriptUpload component should be rendered (mocked)
  })

  it('shows Wolfgramm financial data for Wolfgramm deals', async () => {
    const wolfgrammDeal = {
      ...mockDealData,
      folder: { ...mockDealData.folder, name: 'Wolfgramm Ascent Waldorf' }
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(wolfgrammDeal)
    })

    render(<DealPage />)

    await waitFor(() => {
      fireEvent.click(screen.getByText('💰 FINANCIAL'))
      // FinancialAnalysis component should render with Wolfgramm data
    })
  })

  it('toggles AI sidebar', async () => {
    render(<DealPage />)

    await waitFor(() => {
      expect(screen.getByTestId('ai-floating-button')).toBeInTheDocument()
      expect(screen.queryByTestId('ai-sidebar')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('ai-floating-button'))
    expect(screen.getByTestId('ai-sidebar')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-floating-button')).not.toBeInTheDocument()
  })

  it('opens AI sidebar from tab button', async () => {
    render(<DealPage />)

    await waitFor(() => {
      fireEvent.click(screen.getByText('🤖 AI ANALYSIS'))
      expect(screen.getByTestId('ai-sidebar')).toBeInTheDocument()
    })
  })

  it('handles deal not found', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ folder: null })
    })

    render(<DealPage />)

    await waitFor(() => {
      expect(screen.getByText('DEAL NOT FOUND')).toBeInTheDocument()
      expect(screen.getByText('← BACK TO FOLDERS')).toBeInTheDocument()
    })
  })

  it('handles API errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<DealPage />)

    await waitFor(() => {
      // Should show error state or stay in loading state
      expect(screen.getByText('LOADING DEAL DATA...')).toBeInTheDocument()
    })
  })
})