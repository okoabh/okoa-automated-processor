import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import LoginPage from '../login/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('LoginPage', () => {
  const mockPush = jest.fn()
  const mockRouter = { push: mockPush }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    global.fetch = jest.fn()
  })

  it('renders login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('O K O A')).toBeInTheDocument()
    expect(screen.getByText('🔐 DEMO ACCESS LOGIN')).toBeInTheDocument()
    expect(screen.getByLabelText('USERNAME:')).toBeInTheDocument()
    expect(screen.getByLabelText('PASSWORD:')).toBeInTheDocument()
    expect(screen.getByText('→ LOGIN TO SYSTEM')).toBeInTheDocument()
  })

  it('displays demo credentials hint', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument()
    expect(screen.getByText('demo')).toBeInTheDocument()
    expect(screen.getByText('OKOA2024Demo!')).toBeInTheDocument()
  })

  it('validates required fields', () => {
    render(<LoginPage />)
    
    const loginButton = screen.getByText('→ LOGIN TO SYSTEM')
    expect(loginButton).toBeDisabled()
  })

  it('enables login button when fields are filled', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const usernameInput = screen.getByLabelText('USERNAME:')
    const passwordInput = screen.getByLabelText('PASSWORD:')
    const loginButton = screen.getByText('→ LOGIN TO SYSTEM')

    await user.type(usernameInput, 'demo')
    await user.type(passwordInput, 'password')

    expect(loginButton).not.toBeDisabled()
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true
    })

    // Mock localStorage
    const localStorageMock = {
      setItem: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })

    render(<LoginPage />)
    
    const usernameInput = screen.getByLabelText('USERNAME:')
    const passwordInput = screen.getByLabelText('PASSWORD:')
    const loginButton = screen.getByText('→ LOGIN TO SYSTEM')

    await user.type(usernameInput, 'demo')
    await user.type(passwordInput, 'OKOA2024Demo!')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/', {
        headers: {
          'Authorization': 'Basic ZGVtbzpPS09BMjAyNERlbW8h'
        }
      })
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth', 'ZGVtbzpPS09BMjAyNERlbW8h')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('handles login failure', async () => {
    const user = userEvent.setup()
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401
    })

    render(<LoginPage />)
    
    const usernameInput = screen.getByLabelText('USERNAME:')
    const passwordInput = screen.getByLabelText('PASSWORD:')
    const loginButton = screen.getByText('→ LOGIN TO SYSTEM')

    await user.type(usernameInput, 'wrong')
    await user.type(passwordInput, 'credentials')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument()
    })
  })

  it('shows loading state during login', async () => {
    const user = userEvent.setup()
    
    ;(global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
    )

    render(<LoginPage />)
    
    const usernameInput = screen.getByLabelText('USERNAME:')
    const passwordInput = screen.getByLabelText('PASSWORD:')
    const loginButton = screen.getByText('→ LOGIN TO SYSTEM')

    await user.type(usernameInput, 'demo')
    await user.type(passwordInput, 'password')
    fireEvent.click(loginButton)

    expect(screen.getByText('⏳ AUTHENTICATING...')).toBeInTheDocument()
    expect(loginButton).toBeDisabled()
  })

  it('handles network errors', async () => {
    const user = userEvent.setup()
    
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<LoginPage />)
    
    const usernameInput = screen.getByLabelText('USERNAME:')
    const passwordInput = screen.getByLabelText('PASSWORD:')
    const loginButton = screen.getByText('→ LOGIN TO SYSTEM')

    await user.type(usernameInput, 'demo')
    await user.type(passwordInput, 'password')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
    })
  })
})