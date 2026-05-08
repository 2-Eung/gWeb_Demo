import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchGames } from '../api/game'
import { useDebounce } from '../hooks/useDebounce'
import GameCard from '../components/GameCard'
import styles from './Search.module.css'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const debounced = useDebounce(keyword, 500)

  useEffect(() => {
    if (!debounced.trim()) { setGames([]); return }
    setLoading(true)
    setError(null)
    searchGames(debounced)
      .then(setGames)
      .catch(() => setError('검색 중 오류가 발생했습니다.'))
      .finally(() => setLoading(false))
  }, [debounced])

  const handleChange = (e) => {
    const v = e.target.value
    setKeyword(v)
    setSearchParams(v ? { q: v } : {})
  }

  return (
    <main className={styles.main}>
      <div className={styles.searchBar}>
        <input
          className={styles.input}
          type="text"
          placeholder="게임 이름 검색..."
          value={keyword}
          onChange={handleChange}
          autoFocus
        />
      </div>

      {loading && <p className={styles.status}>검색 중...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && games.length === 0 && debounced && (
        <p className={styles.status}>결과가 없습니다.</p>
      )}

      <div className={styles.grid}>
        {games.map((g) => <GameCard key={g.steamAppId} game={g} />)}
      </div>
    </main>
  )
}
