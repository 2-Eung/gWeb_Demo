import { vi, describe, it, expect, beforeEach } from 'vitest'

// API 모킹
vi.mock('../../src/api/game', () => ({
  getGamesPaged: vi.fn(),
  updateGame: vi.fn(),
  deleteGame: vi.fn(),
  fetchGame: vi.fn(),
}))

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Manage from '../../src/pages/Manage'
import { getGamesPaged, updateGame, deleteGame, fetchGame } from '../../src/api/game'

const mockGames = [
  {
    steamAppId: 570,
    name: 'Dota 2',
    shortDescription: 'Action RTS game by Valve.',
    priceInitial: 0,
    priceFinal: 0,
    genres: ['Action', 'Free to Play'],
    headerImage: 'https://example.com/dota2.jpg',
  },
  {
    steamAppId: 730,
    name: 'Counter-Strike 2',
    shortDescription: 'Tactical shooter.',
    priceInitial: 0,
    priceFinal: 0,
    genres: ['Action', 'Shooter'],
    headerImage: 'https://example.com/cs2.jpg',
  },
]

describe('Manage Page Specification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getGamesPaged.mockResolvedValue({
      content: mockGames,
      totalPages: 1,
    })
  })

  it('renders manage page and lists games', async () => {
    render(
      <MemoryRouter>
        <Manage />
      </MemoryRouter>
    )

    expect(await screen.findByText(/데이터 관리/i)).toBeDefined()
    expect(await screen.findByText('Dota 2')).toBeDefined()
    expect(await screen.findByText('Counter-Strike 2')).toBeDefined()
  })

  it('handles Direct Update (editing fields and saving)', async () => {
    updateGame.mockResolvedValue({ success: true })

    render(
      <MemoryRouter>
        <Manage />
      </MemoryRouter>
    )

    await screen.findByText('Dota 2')

    const editBtns = screen.getAllByRole('button', { name: /수정/i })
    fireEvent.click(editBtns[0])

    expect(screen.getByText('게임 정보 수정')).toBeDefined()

    const nameInput = screen.getByDisplayValue('Dota 2')
    fireEvent.change(nameInput, { target: { value: 'Dota 2 Updated' } })

    const saveBtn = screen.getByRole('button', { name: /저장/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(updateGame).toHaveBeenCalledWith(
        570,
        expect.objectContaining({
          name: 'Dota 2 Updated',
        })
      )
    })
  })

  it('handles Fetch Update (triggering Steam sync)', async () => {
    fetchGame.mockResolvedValue({ success: true })

    render(
      <MemoryRouter>
        <Manage />
      </MemoryRouter>
    )

    await screen.findByText('Dota 2')

    const syncBtns = screen.getAllByRole('button', { name: /Steam 동기화/i })
    fireEvent.click(syncBtns[0])

    await waitFor(() => {
      expect(fetchGame).toHaveBeenCalledWith(570)
    })
  })

  it('handles Delete operation with user confirmation', async () => {
    deleteGame.mockResolvedValue({ success: true })
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true)

    render(
      <MemoryRouter>
        <Manage />
      </MemoryRouter>
    )

    await screen.findByText('Dota 2')

    const deleteBtns = screen.getAllByRole('button', { name: /삭제/i })
    fireEvent.click(deleteBtns[0])

    expect(confirmSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(deleteGame).toHaveBeenCalledWith(570)
    })

    confirmSpy.mockRestore()
  })

  it('verifies visual confirmation of deletion via toast message', async () => {
    deleteGame.mockResolvedValue({ success: true })
    vi.spyOn(window, 'confirm').mockImplementation(() => true)

    render(
      <MemoryRouter>
        <Manage />
      </MemoryRouter>
    )

    await screen.findByText('Dota 2')

    const deleteBtns = screen.getAllByRole('button', { name: /삭제/i })
    fireEvent.click(deleteBtns[0])

    expect(await screen.findByText(/성공적으로 삭제했습니다/i)).toBeDefined()
  })

  // INTENTIONAL FAILING TEST CASE FOR SPEC REGISTRATION
  it('verifies direct access audit logs and database synchronization confirmation', () => {
    // 이 테스트는 전략적 요구사항인 '감사 로그 시스템'이 프론트엔드에 표시되는지 확인합니다.
    // 현재 프론트엔드에는 이 감사 로그(Audit Logs) UI가 구현되지 않았으므로 실패하게 됩니다.
    // 이는 스펙을 '실패 테스트'로 등록하라는 사용자 요청에 따른 것입니다.
    render(
      <MemoryRouter>
        <Manage />
      </MemoryRouter>
    )

    // 의도적인 테스트 실패 유도 (감사 로그 텍스트가 화면에 노출되어야 하지만 없음)
    const auditLogsSection = screen.getByText('동기화 및 삭제 감사 로그')
    expect(auditLogsSection).toBeDefined()
  })
})
