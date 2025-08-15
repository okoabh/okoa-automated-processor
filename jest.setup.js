import '@testing-library/jest-dom'

// Mock Next.js Request/Response
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = input
    this.method = init.method || 'GET'
    this.headers = new Map(Object.entries(init.headers || {}))
    this.body = init.body
  }
  
  async json() {
    return JSON.parse(this.body || '{}')
  }
}

global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.headers = new Map(Object.entries(init.headers || {}))
  }
  
  async json() {
    return JSON.parse(this.body)
  }
}

// Mock environment variables for tests
process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-convex-url.convex.cloud'
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
process.env.DEMO_PASSWORD_REQUIRED = 'true'
process.env.DEMO_PASSWORD = 'test-password'

// Mock fetch for API calls in tests
global.fetch = jest.fn()

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  useParams() {
    return {}
  },
}))

// Mock Convex client
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  ConvexProvider: ({ children }) => children,
  ConvexReactClient: jest.fn(),
}))

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})