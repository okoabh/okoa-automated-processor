import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AISidebar, AIFloatingButton } from '../ai/AISidebar'

// Mock fetch for API calls
global.fetch = jest.fn()

describe('AISidebar', () => {
  const defaultProps = {
    isOpen: true,
    onToggle: jest.fn(),
    dealId: 'test-deal-id',
    dealName: 'Test Deal',
    context: { documents: [] }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(<AISidebar {...defaultProps} />)
    expect(screen.getByText('MIDNIGHT ATLAS PRISM')).toBeInTheDocument()
    expect(screen.getByText('Real Estate Analysis Agent v1.1')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<AISidebar {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('MIDNIGHT ATLAS PRISM')).not.toBeInTheDocument()
  })

  it('displays deal context', () => {
    render(<AISidebar {...defaultProps} />)
    expect(screen.getByText('ANALYZING: TEST DEAL')).toBeInTheDocument()
  })

  it('handles close button click', () => {
    const onToggle = jest.fn()
    render(<AISidebar {...defaultProps} onToggle={onToggle} />)
    
    fireEvent.click(screen.getByText('✕'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('handles message input and submission', async () => {
    const user = userEvent.setup()
    const mockResponse = { response: 'Test AI response', agent: 'test-agent', timestamp: Date.now() }
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    render(<AISidebar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/Ask about financial analysis/)
    const sendButton = screen.getByText('→')

    await user.type(input, 'What are the risks?')
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/deals/test-deal-id/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'What are the risks?',
          context: { documents: [] }
        })
      })
    })
  })

  it('displays loading state during request', async () => {
    const user = userEvent.setup()
    
    ;(global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ response: 'Test response', agent: 'test', timestamp: Date.now() })
      }), 100))
    )

    render(<AISidebar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/Ask about financial analysis/)
    await user.type(input, 'Test message')
    fireEvent.click(screen.getByText('→'))

    expect(screen.getByText('⚡')).toBeInTheDocument()
    expect(screen.getByText(/Processing your request/)).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<AISidebar {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/Ask about financial analysis/)
    await user.type(input, 'Test message')
    fireEvent.click(screen.getByText('→'))

    await waitFor(() => {
      expect(screen.getByText(/I apologize, but I encountered an error/)).toBeInTheDocument()
    })
  })

  it('renders quick question buttons', () => {
    render(<AISidebar {...defaultProps} />)
    
    expect(screen.getByText('What are the key risks?')).toBeInTheDocument()
    expect(screen.getByText('Financial summary?')).toBeInTheDocument()
    expect(screen.getByText('Market analysis?')).toBeInTheDocument()
    expect(screen.getByText('ROI projections?')).toBeInTheDocument()
  })

  it('handles quick question clicks', async () => {
    const user = userEvent.setup()
    render(<AISidebar {...defaultProps} />)
    
    fireEvent.click(screen.getByText('Financial summary?'))
    
    const input = screen.getByPlaceholderText(/Ask about financial analysis/) as HTMLInputElement
    expect(input.value).toBe('Financial summary?')
  })
})

describe('AIFloatingButton', () => {
  it('renders correctly', () => {
    const onClick = jest.fn()
    render(<AIFloatingButton onClick={onClick} />)
    
    expect(screen.getByText('🤖')).toBeInTheDocument()
    expect(screen.getByText('AI AGENT')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const onClick = jest.fn()
    render(<AIFloatingButton onClick={onClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})