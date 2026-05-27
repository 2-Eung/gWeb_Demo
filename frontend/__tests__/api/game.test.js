import { vi, describe, it, expect, beforeEach } from 'vitest'
import client from '../../src/api/client'
import {
  fetchGame,
  searchGames,
  getGame,
  sendQuery,
  getGamesPaged,
  updateGame,
  deleteGame,
} from '../../src/api/game'

vi.mock('../../src/api/client', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('game API client wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchGame should make a POST request to /games/fetch with appId', async () => {
    client.post.mockResolvedValueOnce({ data: { success: true } })
    const res = await fetchGame(570)
    expect(client.post).toHaveBeenCalledWith('/games/fetch', { appId: 570 })
    expect(res).toEqual({ success: true })
  })

  it('searchGames should make a GET request to /games/search with keyword', async () => {
    client.get.mockResolvedValueOnce({ data: ['game1', 'game2'] })
    const res = await searchGames('test')
    expect(client.get).toHaveBeenCalledWith('/games/search', { params: { keyword: 'test' } })
    expect(res).toEqual(['game1', 'game2'])
  })

  it('getGame should make a GET request to /games/:steamAppId', async () => {
    client.get.mockResolvedValueOnce({ data: { name: 'Dota 2' } })
    const res = await getGame(570)
    expect(client.get).toHaveBeenCalledWith('/games/570')
    expect(res).toEqual({ name: 'Dota 2' })
  })

  it('sendQuery should make a POST request to /query with query and sessionId', async () => {
    client.post.mockResolvedValueOnce({ data: { answer: 'AI answer' } })
    const res = await sendQuery('hello', 'session123')
    expect(client.post).toHaveBeenCalledWith('/query', { query: 'hello', sessionId: 'session123' })
    expect(res).toEqual({ answer: 'AI answer' })
  })

  it('getGamesPaged should make a GET request to /games with page and size defaults', async () => {
    client.get.mockResolvedValueOnce({ data: { content: [] } })
    const res = await getGamesPaged()
    expect(client.get).toHaveBeenCalledWith('/games', { params: { page: 0, size: 8 } })
    expect(res).toEqual({ content: [] })
  })

  it('getGamesPaged should make a GET request to /games with custom page and size', async () => {
    client.get.mockResolvedValueOnce({ data: { content: [] } })
    const res = await getGamesPaged(2, 10)
    expect(client.get).toHaveBeenCalledWith('/games', { params: { page: 2, size: 10 } })
    expect(res).toEqual({ content: [] })
  })

  it('updateGame should make a PUT request to /games/:steamAppId with updatedData', async () => {
    client.put.mockResolvedValueOnce({ data: { success: true } })
    const res = await updateGame(570, { name: 'New Name' })
    expect(client.put).toHaveBeenCalledWith('/games/570', { name: 'New Name' })
    expect(res).toEqual({ success: true })
  })

  it('deleteGame should make a DELETE request to /games/:steamAppId', async () => {
    client.delete.mockResolvedValueOnce({ data: { success: true } })
    const res = await deleteGame(570)
    expect(client.delete).toHaveBeenCalledWith('/games/570')
    expect(res).toEqual({ success: true })
  })
})
