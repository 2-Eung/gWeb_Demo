import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Home from '../../src/pages/Home'
import { MOCK_DOTA_2, MOCK_CS2 } from '../mocks/gameMocks'
import { FALLBACK_PAGE_SIZE } from '../../src/constants'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const { mockGetGamesPaged } = vi.hoisted(() => ({
  mockGetGamesPaged: vi.fn(),
}))

// API 모킹
vi.mock('../../src/api/game', () => ({
  getGamesPaged: mockGetGamesPaged,
}))

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 기본 모킹 데이터 설정 (에러 방지용)
    mockGetGamesPaged.mockResolvedValue({
      content: [],
      number: 0,
      totalPages: 1,
      totalElements: 0,
      size: FALLBACK_PAGE_SIZE,
      first: true,
      last: true,
    })
  })

  it('renders home page with correct title', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /게임을 탐색하세요/i })).toBeDefined()
  })

  it('renders search input and button', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText(/게임 이름을 입력하세요/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /^검색$/ })).toBeDefined()
  })

  it('renders feature cards', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByText('게임 검색')).toBeDefined()
    expect(screen.getByText('AI 분석')).toBeDefined()
    expect(screen.getByText('게임 등록')).toBeDefined()
  })

  it('fetches and renders registered games list on load', async () => {
    mockGetGamesPaged.mockResolvedValueOnce({
      content: [
        { ...MOCK_DOTA_2, id: 1 },
        { ...MOCK_CS2, id: 2 },
      ],
      number: 0,
      totalPages: 3,
      totalElements: 6,
      size: 2,
      first: true,
      last: false,
    })

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    // "등록된 게임" 섹션 제목 검증
    expect(await screen.findByRole('heading', { name: /등록된 게임/i })).toBeDefined()

    // 게임 카드 렌더링 확인
    expect(await screen.findByText('Dota 2')).toBeDefined()
    expect(await screen.findByText('Counter-Strike 2')).toBeDefined()
  })

  it('renders pagination controls and handles page navigation', async () => {
    mockGetGamesPaged.mockResolvedValueOnce({
      content: [
        { ...MOCK_DOTA_2, id: 1 },
      ],
      number: 0,
      totalPages: 3,
      totalElements: 3,
      size: 1,
      first: true,
      last: false,
    })

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    // 페이지네이션 컨트롤 존재 여부 확인
    expect(await screen.findByRole('button', { name: /이전/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /다음/i })).toBeDefined()
    expect(screen.getByRole('button', { name: '2' })).toBeDefined()

    // 첫 페이지이므로 "이전" 버튼은 비활성화 상태여야 함
    expect(screen.getByRole('button', { name: /이전/i }).hasAttribute('disabled')).toBe(true)

    // 다음 페이지 데이터 모킹
    mockGetGamesPaged.mockResolvedValueOnce({
      content: [
        { ...MOCK_CS2, id: 2 },
      ],
      number: 1,
      totalPages: 3,
      totalElements: 3,
      size: 1,
      first: false,
      last: false,
    })

    // "다음" 버튼 클릭
    const nextBtn = screen.getByRole('button', { name: /다음/i })
    nextBtn.click()

    // 2페이지 게임 렌더링 확인
    expect(await screen.findByText('Counter-Strike 2')).toBeDefined()
    expect(mockGetGamesPaged).toHaveBeenCalledWith(1, FALLBACK_PAGE_SIZE)
  })

  it('should navigate to search page when submitting search form with keyword', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText(/게임 이름을 입력하세요/i)
    const form = screen.getByRole('button', { name: /^검색$/ }).closest('form')

    fireEvent.change(input, { target: { value: 'Dota' } })
    fireEvent.submit(form)

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=Dota')
  })

  it('should navigate to correct pages when feature cards are clicked', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    // Click "게임 검색" card
    fireEvent.click(screen.getByRole('button', { name: /게임 검색/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/search')

    // Click "AI 분석" card
    fireEvent.click(screen.getByRole('button', { name: /AI 분석/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/chat')

    // Click "게임 등록" card
    fireEvent.click(screen.getByRole('button', { name: /게임 등록/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/fetch')
  })
})
