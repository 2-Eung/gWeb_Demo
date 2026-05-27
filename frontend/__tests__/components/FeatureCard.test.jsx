import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect } from 'vitest'
import FeatureCard from '../../src/components/FeatureCard'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('FeatureCard Component', () => {
  it('renders features card with correct props', () => {
    render(
      <MemoryRouter>
        <FeatureCard title='Test Title' desc='Test Description' icon='⭐' to='/test' />
      </MemoryRouter>
    )

    expect(screen.getByText('Test Title')).toBeDefined()
    expect(screen.getByText('Test Description')).toBeDefined()
    expect(screen.getByText('⭐')).toBeDefined()
  })

  it('navigates to target path when clicked', () => {
    render(
      <MemoryRouter>
        <FeatureCard title='Test Title' desc='Test Description' icon='⭐' to='/test' />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/test')
  })
})
