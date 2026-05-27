import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// API 모킹
vi.mock('../../src/api/game', () => ({
  getGame: vi.fn(),
}))

import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { getGame } from '../../src/api/game'
import GameDetail from '../../src/pages/GameDetail'
import { MOCK_DOTA_2 as mockGameData } from '../mocks/gameMocks'

describe('GameDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders loading state initially', async () => {
    getGame.mockReturnValue(new Promise(() => {})) // pending promise
    render(
      <MemoryRouter initialEntries={['/game/570']}>
        <Routes>
          <Route path='/game/:steamAppId' element={<GameDetail />} />
        </Routes>
      </MemoryRouter>
    )
    expect(await screen.findByText(/불러오는 중/i)).toBeDefined()
  })

  it('renders error state on API failure', async () => {
    const unhandledRejectionHandler = e => {
      e.preventDefault()
    }
    window.addEventListener('unhandledrejection', unhandledRejectionHandler)

    getGame.mockRejectedValueOnce(new Error('게임 정보를 불러오지 못했습니다.'))
    render(
      <MemoryRouter initialEntries={['/game/570']}>
        <Routes>
          <Route path='/game/:steamAppId' element={<GameDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('게임 정보를 불러오지 못했습니다.')).toBeDefined()
    })

    window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
  })

  it('renders full game details correctly after load', async () => {
    getGame.mockResolvedValueOnce(mockGameData)
    render(
      <MemoryRouter initialEntries={['/game/570']}>
        <Routes>
          <Route path='/game/:steamAppId' element={<GameDetail />} />
        </Routes>
      </MemoryRouter>
    )

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByText('Dota 2')).toBeDefined()
    })

    expect(screen.getByText('Action RTS game by Valve.')).toBeDefined()
    expect(screen.getByAltText('Dota 2')).toBeDefined()
    expect(screen.getByText('무료')).toBeDefined()
    expect(screen.getByText('호감도 80% (1,000개 리뷰)')).toBeDefined()
    expect(screen.getByText('Metacritic 90')).toBeDefined()
    expect(screen.getByText('Action')).toBeDefined()
    expect(screen.getByText('Strategy')).toBeDefined()
    expect(screen.getByText('MOBA')).toBeDefined()
    expect(screen.getByText('Multiplayer')).toBeDefined()
    expect(screen.getByText('Free to Play')).toBeDefined()

    const steamLink = screen.getByRole('link', { name: /Steam에서 보기/ })
    expect(steamLink.getAttribute('href')).toBe('https://store.steampowered.com/app/570')
  })

  it('renders discount price rendering', async () => {
    const discountedGame = {
      ...mockGameData,
      priceInitial: 20000,
      priceFinal: 10000,
    }
    getGame.mockResolvedValueOnce(discountedGame)
    render(
      <MemoryRouter initialEntries={['/game/570']}>
        <Routes>
          <Route path='/game/:steamAppId' element={<GameDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('-50%')).toBeDefined()
    })
    expect(screen.getByText('₩20,000')).toBeDefined()
    expect(screen.getByText('₩10,000')).toBeDefined()
  })

  it('renders price TBD when priceFinal is null', async () => {
    const tbdGame = {
      ...mockGameData,
      priceFinal: null,
    }
    getGame.mockResolvedValueOnce(tbdGame)
    render(
      <MemoryRouter initialEntries={['/game/570']}>
        <Routes>
          <Route path='/game/:steamAppId' element={<GameDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('가격 미정')).toBeDefined()
    })
  })

  it('renders low sentiment rating (less than 70%)', async () => {
    const lowSentimentGame = {
      ...mockGameData,
      positiveReviews: 40,
      negativeReviews: 60,
    }
    getGame.mockResolvedValueOnce(lowSentimentGame)
    render(
      <MemoryRouter initialEntries={['/game/570']}>
        <Routes>
          <Route path='/game/:steamAppId' element={<GameDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('호감도 40% (100개 리뷰)')).toBeDefined()
    })
  })
})
