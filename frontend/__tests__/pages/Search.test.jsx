import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// API 모킹
vi.mock('../../src/api/game', () => ({
  searchGames: vi.fn(),
}))

import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { searchGames } from '../../src/api/game'
import { NO_SEARCH_RESULTS_MESSAGE } from '../../src/constants'
import { MOCK_CS2 } from '../mocks/gameMocks'
import Search from '../../src/pages/Search'

const mockSearchGames = [MOCK_CS2]

describe('Search Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchGames.mockResolvedValue([])
  })

  afterEach(() => {
    cleanup()
  })

  it('renders search page with input field', async () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    )
    expect(await screen.findByPlaceholderText(/게임 이름 검색/i)).toBeDefined()
  })

  it('should trigger searchGames after debouncing when keyword is entered', async () => {
    searchGames.mockResolvedValueOnce(mockSearchGames)
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/게임 이름 검색/i)
    fireEvent.change(input, { target: { value: 'Counter' } })

    // Verify loading indicator is displayed and searchGames is eventually called
    await waitFor(() => {
      expect(searchGames).toHaveBeenCalledWith('Counter')
    }, { timeout: 1000 })

    // Verify it renders the search result card
    await waitFor(() => {
      expect(screen.getByText('Counter-Strike 2')).toBeDefined()
    })
    expect(screen.getByText('₩12,000')).toBeDefined()
  })

  it('should show empty results message when no matches are found', async () => {
    searchGames.mockResolvedValueOnce([])
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/게임 이름 검색/i)
    fireEvent.change(input, { target: { value: 'NonExistentGame' } })

    await waitFor(() => {
      expect(searchGames).toHaveBeenCalledWith('NonExistentGame')
    }, { timeout: 1000 })

    await waitFor(() => {
      expect(screen.getByText(NO_SEARCH_RESULTS_MESSAGE)).toBeDefined()
    })
  })

  it('should display error message on search failure', async () => {
    const unhandledRejectionHandler = (e) => {
      e.preventDefault()
    }
    window.addEventListener('unhandledrejection', unhandledRejectionHandler)

    searchGames.mockRejectedValueOnce(new Error('검색 서비스 에러'))
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/게임 이름 검색/i)
    fireEvent.change(input, { target: { value: 'Counter' } })

    await waitFor(() => {
      expect(screen.getByText('검색 서비스 에러')).toBeDefined()
    })

    window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
  })
})
