import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// API 모킹
vi.mock('../../src/api/game', () => ({
  fetchGame: vi.fn(),
}))

import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { fetchGame } from '../../src/api/game'
import Fetch from '../../src/pages/Fetch'

describe('Fetch Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders fetch page with title and description', () => {
    render(
      <MemoryRouter>
        <Fetch />
      </MemoryRouter>
    )
    expect(screen.getByText(/게임 등록/i)).toBeDefined()
    expect(screen.getByText(/Steam App ID를 입력하면/i)).toBeDefined()
  })

  it('renders input field and fetch button', () => {
    render(
      <MemoryRouter>
        <Fetch />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText(/Steam App ID \(예: 570\)/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /데이터 수집/i })).toBeDefined()
  })

  it('should fetch game details when submitting form with a valid ID', async () => {
    fetchGame.mockResolvedValueOnce({
      steamAppId: 570,
      name: 'Dota 2',
      shortDescription: 'MOBA game by Valve.',
      headerImage: 'dota2.jpg',
    })
    render(
      <MemoryRouter>
        <Fetch />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/Steam App ID \(예: 570\)/i)
    const button = screen.getByRole('button', { name: /데이터 수집/i })

    fireEvent.change(input, { target: { value: '570' } })
    fireEvent.click(button)

    // Verify it changed to loading state
    expect(screen.getByText('수집 중...')).toBeDefined()

    // Wait for success and verify result card
    await waitFor(() => {
      expect(screen.getByText('수집 완료!')).toBeDefined()
    })
    expect(screen.getByRole('heading', { name: 'Dota 2' })).toBeDefined()
    expect(screen.getByText(/MOBA game by Valve/)).toBeDefined()

    // Click details button and verify navigate is called
    const detailBtn = screen.getByRole('button', { name: /상세 보기 →/ })
    fireEvent.click(detailBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/game/570')
  })

  it('should not fetch game details when submitting form with an invalid ID', () => {
    render(
      <MemoryRouter>
        <Fetch />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/Steam App ID \(예: 570\)/i)
    const button = screen.getByRole('button', { name: /데이터 수집/i })

    // Input invalid id (e.g. <= 0)
    fireEvent.change(input, { target: { value: '0' } })
    fireEvent.click(button)

    expect(fetchGame).not.toHaveBeenCalled()
  })

  it('should display error message on fetch failure', async () => {
    const unhandledRejectionHandler = e => {
      e.preventDefault()
    }
    window.addEventListener('unhandledrejection', unhandledRejectionHandler)

    fetchGame.mockRejectedValueOnce(new Error('데이터를 가져오는데 실패했습니다.'))
    render(
      <MemoryRouter>
        <Fetch />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/Steam App ID \(예: 570\)/i)
    const button = screen.getByRole('button', { name: /데이터 수집/i })

    fireEvent.change(input, { target: { value: '570' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('데이터를 가져오는데 실패했습니다.')).toBeDefined()
    })

    window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
  })
})
