import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchGame } from '../api/game'
import styles from './Fetch.module.css'

export default function Fetch() {
  const [appId, setAppId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const id = Number(appId)
    if (!id || id <= 0) { setError('유효한 App ID를 입력하세요.'); return }

    setLoading(true)
    setError(null)
    setResult(null)

    fetchGame(id)
      .then(setResult)
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || '알 수 없는 오류'
        setError(`게임 데이터 수집 실패: ${msg}`)
      })
      .finally(() => setLoading(false))
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>게임 등록</h1>
        <p className={styles.desc}>
          Steam App ID를 입력하면 Steam/SteamSpy API를 통해 게임 데이터를 수집하고 DB에 저장합니다.
        </p>
        <p className={styles.hint}>
          App ID는 Steam 게임 페이지 URL에서 확인할 수 있습니다.
          <br />예: store.steampowered.com/app/<strong>570</strong> → App ID: 570
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="number"
            placeholder="Steam App ID (예: 570)"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            disabled={loading}
            min="1"
          />
          <button type="submit" className={styles.btn} disabled={loading || !appId}>
            {loading ? '수집 중...' : '데이터 수집'}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        {result && (
          <div className={styles.result}>
            <p className={styles.success}>수집 완료!</p>
            <div className={styles.gamePreview}>
              {result.headerImage && (
                <img src={result.headerImage} alt={result.name} className={styles.previewImg} />
              )}
              <div>
                <h3>{result.name}</h3>
                <p className={styles.muted}>{result.shortDescription?.slice(0, 120)}...</p>
              </div>
            </div>
            <button
              className={styles.viewBtn}
              onClick={() => navigate(`/game/${result.steamAppId}`)}
            >
              상세 보기 →
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
