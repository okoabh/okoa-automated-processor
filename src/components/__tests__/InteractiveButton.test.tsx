import { render, screen, fireEvent } from '@testing-library/react'
import { InteractiveButton } from '../ascii/InteractiveButton'

describe('InteractiveButton', () => {
  it('renders with correct text', () => {
    render(<InteractiveButton>Click me</InteractiveButton>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<InteractiveButton onClick={handleClick}>Click me</InteractiveButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies primary variant styles', () => {
    render(<InteractiveButton variant="primary">Primary</InteractiveButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-okoa-fg-primary')
  })

  it('applies secondary variant styles', () => {
    render(<InteractiveButton variant="secondary">Secondary</InteractiveButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-transparent')
  })

  it('is disabled when disabled prop is true', () => {
    render(<InteractiveButton disabled>Disabled</InteractiveButton>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50')
  })

  it('applies custom className', () => {
    render(<InteractiveButton className="custom-class">Test</InteractiveButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('handles small size variant', () => {
    render(<InteractiveButton size="sm">Small</InteractiveButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-3', 'py-1', 'text-xs')
  })

  it('handles large size variant', () => {
    render(<InteractiveButton size="lg">Large</InteractiveButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
  })
})