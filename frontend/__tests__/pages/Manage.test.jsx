import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

vi.mock('../../src/api/game', () => ({
  getGamesPaged: vi.fn(),
  updateGame: vi.fn(),
  deleteGame: vi.fn(),
  fetchGame: vi.fn(),
}))

import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getGamesPaged, updateGame, deleteGame, fetchGame } from '../../src/api/game'

const FIRST_PAGE = 0
const PAGE_SIZE = 8
const FIRST_GAME_APP_ID = 570
const FIRST_GAME_NAME = 'Dota 2'

const mockGames = [
  {
    steamAppId: FIRST_GAME_APP_ID,
    name: FIRST_GAME_NAME,
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
    priceFinal: 12000,
    genres: ['Action', 'Shooter'],
    headerImage: 'https://example.com/cs2.jpg',
  },
]

const tableHeaders = ['게임 정보', 'Steam App ID', '가격', '장르', '작업']
const priceLabels = ['무료', '₩12,000']

async function renderManage() {
  const { default: Manage } = await import('../../src/pages/Manage')

  return render(
    <MemoryRouter>
      <Manage />
    </MemoryRouter>
  )
}

async function renderLoadedManage() {
  await renderManage()
  await screen.findByText(FIRST_GAME_NAME)
}

function clickFirstActionButton(name) {
  fireEvent.click(screen.getAllByRole('button', { name })[0])
}

function cancelDialog(dialog) {
  fireEvent(dialog, new Event('cancel', { cancelable: true }))
}

async function openEditDialog() {
  await renderLoadedManage()
  clickFirstActionButton('수정')
  return screen.getByRole('dialog', { name: '게임 정보 수정' })
}

describe('Manage Page regression specifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getGamesPaged.mockResolvedValue({
      content: mockGames,
      totalPages: 1,
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('loads without syntax or runtime errors and requests the first page', async () => {
    await renderManage()

    await waitFor(() => {
      expect(getGamesPaged).toHaveBeenCalledWith(FIRST_PAGE, PAGE_SIZE)
    })
  })

  it('renders the Korean management title and table headers without mojibake', async () => {
    await renderManage()

    expect(await screen.findByRole('heading', { name: '게임 데이터 관리' })).toBeInTheDocument()
    tableHeaders.forEach(header => {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument()
    })
  })

  it('renders game rows with readable free and paid prices', async () => {
    await renderLoadedManage()

    priceLabels.forEach(price => {
      expect(screen.getByText(price)).toBeInTheDocument()
    })
  })

  it('opens the edit modal with accessible Korean controls and saves edited fields', async () => {
    updateGame.mockResolvedValue({ success: true })

    expect(await openEditDialog()).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '게임 정보 수정' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('게임 이름'), {
      target: { value: 'Dota 2 Updated' },
    })
    fireEvent.change(screen.getByLabelText('장르 (쉼표로 구분)'), {
      target: { value: 'Action, Strategy' },
    })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => {
      expect(updateGame).toHaveBeenCalledWith(
        FIRST_GAME_APP_ID,
        expect.objectContaining({
          name: 'Dota 2 Updated',
          genres: ['Action', 'Strategy'],
        })
      )
    })
  })

  it('closes the edit dialog through the native cancel event', async () => {
    const dialog = await openEditDialog()

    cancelDialog(dialog)

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: '게임 정보 수정' })).not.toBeInTheDocument()
    })
  })

  it('closes the edit dialog when the backdrop is clicked', async () => {
    const dialog = await openEditDialog()

    fireEvent.click(dialog)

    expect(screen.queryByRole('dialog', { name: '게임 정보 수정' })).not.toBeInTheDocument()
  })

  it('keeps the edit dialog open while a save is pending', async () => {
    updateGame.mockReturnValue(new Promise(() => {}))
    const dialog = await openEditDialog()

    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '취소' })).toBeDisabled()
    })
    cancelDialog(dialog)

    expect(screen.getByRole('dialog', { name: '게임 정보 수정' })).toBeInTheDocument()
  })

  it('syncs one game from Steam and shows a readable success message', async () => {
    fetchGame.mockResolvedValue({ success: true })
    await renderLoadedManage()

    clickFirstActionButton('Steam 동기화')

    await waitFor(() => {
      expect(fetchGame).toHaveBeenCalledWith(FIRST_GAME_APP_ID)
    })
    expect(
      await screen.findByText(
        `"${FIRST_GAME_NAME}" 게임 정보를 Steam에서 성공적으로 동기화했습니다.`
      )
    ).toBeInTheDocument()
  })

  it('deletes one game after confirmation and shows a readable success message', async () => {
    deleteGame.mockResolvedValue({ success: true })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await renderLoadedManage()

    clickFirstActionButton('삭제')

    expect(window.confirm).toHaveBeenCalledWith(`"${FIRST_GAME_NAME}" 게임을 삭제하시겠습니까?`)
    await waitFor(() => {
      expect(deleteGame).toHaveBeenCalledWith(FIRST_GAME_APP_ID)
    })
    expect(
      await screen.findByText(`"${FIRST_GAME_NAME}" 게임이 성공적으로 삭제되었습니다.`)
    ).toBeInTheDocument()
  })

  it('shows a readable audit log section with synchronization and deletion history copy', async () => {
    await renderManage()

    expect(
      await screen.findByRole('heading', { name: '동기화 및 삭제 감사 로그' })
    ).toBeInTheDocument()
    expect(screen.getByText(/최근 데이터 변경 및 동기화, 삭제 이력을/)).toBeInTheDocument()
  })
})
