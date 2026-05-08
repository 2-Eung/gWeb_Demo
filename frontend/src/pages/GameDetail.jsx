import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGame } from '../api/game'
import styles from './GameDetail.module.css'

export default function GameDetail() {
  const { steamAppId } = useParams()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getGame(steamAppId)
      .then(setGame)
      .catch(() => setError('게임 정보를 불러올 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [steamAppId])

  if (loading) return <div className={styles.center}>불러오는 중...</div>
  if (error) return <div className={styles.center + ' ' + styles.error}>{error}</div>
  if (!game) return null

  const total = (game.positiveReviews ?? 0) + (game.negativeReviews ?? 0)
  const ratio = total > 0 ? Math.round((game.positiveReviews / total) * 100) : null

  return (
    <main className={styles.main}>
      <Link to="/search" className={styles.back}>← 검색으로</Link>

      <div className={styles.header}>
        {game.headerImage && <img src={game.headerImage} alt={game.name} className={styles.headerImg} />}
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{game.name}</h1>
          {game.shortDescription && <p className={styles.desc}>{game.shortDescription}</p>}
          <div className={styles.metaRow}>
            {game.priceFinal != null && (
              <span className={styles.price}>
                {game.priceFinal === 0 ? '무료' : `₩${game.priceFinal.toLocaleString()}`}
              </span>
            )}
            {ratio !== null && (
              <span className={ratio >= 70 ? styles.positive : styles.negative}>
                호감도 {ratio}% ({total.toLocaleString()}개 리뷰)
              </span>
            )}
            {game.metacriticScore && (
              <span className={styles.metacritic}>Metacritic {game.metacriticScore}</span>
            )}
          </div>
          {game.genres?.length > 0 && (
            <div className={styles.tags}>
              {game.genres.map((g) => <span key={g} className={styles.tag}>{g}</span>)}
            </div>
          )}
        </div>
      </div>

      {game.tags?.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>유저 태그</h2>
          <div className={styles.tags}>
            {game.tags.slice(0, 15).map((t) => <span key={t} className={styles.tag}>{t}</span>)}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Steam 링크</h2>
        <a
          href={`https://store.steampowered.com/app/${game.steamAppId}`}
          target="_blank"
          rel="noreferrer"
          className={styles.steamLink}
        >
          Steam에서 보기 →
        </a>
      </section>
    </main>
  )
}
