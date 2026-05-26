import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// API 모킹
vi.mock('../../src/api/game', () => ({
  sendQuery: vi.fn(),
}))

import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { sendQuery } from '../../src/api/game'
import Chat from '../../src/pages/Chat'

describe('Chat Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders chat page with initial assistant message', () => {
    render(
      <MemoryRouter>
        <Chat />
      </MemoryRouter>
    )
    expect(screen.getByText(/AI 게임 분석/i)).toBeDefined()
    expect(screen.getByText(/안녕하세요! 게임에 대해 무엇이든 물어보세요/i)).toBeDefined()
  })

  it('renders input area and send button', () => {
    render(
      <MemoryRouter>
        <Chat />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText(/게임에 대해 질문하세요/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /전송/i })).toBeDefined()
  })

  it('should send query and display AI response when clicking send button', async () => {
    sendQuery.mockResolvedValueOnce({ answer: '추천 게임은 마인크래프트입니다.' })
    render(
      <MemoryRouter>
        <Chat />
      </MemoryRouter>
    )

    const textarea = screen.getByPlaceholderText(/게임에 대해 질문하세요/i)
    const sendBtn = screen.getByRole('button', { name: /전송/i })

    fireEvent.change(textarea, { target: { value: '재미있는 게임 추천해줘' } })
    fireEvent.click(sendBtn)

    // User message should be displayed immediately
    expect(screen.getByText('재미있는 게임 추천해줘')).toBeDefined()

    // Loading indicator "분석 중..." should appear
    expect(screen.getByText('분석 중...')).toBeDefined()

    // AI message should be displayed after promise resolves
    await waitFor(() => {
      expect(screen.getByText('추천 게임은 마인크래프트입니다.')).toBeDefined()
    })
    expect(screen.queryByText('분석 중...')).toBeNull()
  })

  it('should send query on pressing Enter key', async () => {
    sendQuery.mockResolvedValueOnce({ answer: '그 게임은 아주 인기가 많아요.' })
    render(
      <MemoryRouter>
        <Chat />
      </MemoryRouter>
    )

    const textarea = screen.getByPlaceholderText(/게임에 대해 질문하세요/i)
    fireEvent.change(textarea, { target: { value: '엘든 링에 대해 알려줘' } })
    
    // Press Shift+Enter - should NOT send query (does nothing)
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    expect(sendQuery).not.toHaveBeenCalled()

    // Press Enter - should send query
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })

    await waitFor(() => {
      expect(screen.getByText('그 게임은 아주 인기가 많아요.')).toBeDefined()
    })
  })

  it('should display error message on query failure', async () => {
    const errorMsg = '네트워크 통신 에러'
    sendQuery.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMsg,
        },
      },
    })
    render(
      <MemoryRouter>
        <Chat />
      </MemoryRouter>
    )

    const textarea = screen.getByPlaceholderText(/게임에 대해 질문하세요/i)
    const sendBtn = screen.getByRole('button', { name: /전송/i })

    fireEvent.change(textarea, { target: { value: '오류 테스트' } })
    fireEvent.click(sendBtn)

    await waitFor(() => {
      expect(screen.getByText(`오류: ${errorMsg}`)).toBeDefined()
    })
  })
})
