import { Link } from 'react-router-dom'
import styles from './GameCard.module.css'

export default function GameCard({ game }) {
  const total = (game.positiveReviews ?? 0) + (game.negativeReviews ?? 0)
  const ratio = total > 0 ? Math.round((game.positiveReviews / total) * 100) : null

  return (
    <Link to={`/game/${game.steamAppId}`} className={styles.card}>
      {game.headerImage && (
        <img src={game.headerImage} alt={game.name} className={styles.img} />
      )}
      <div className={styles.body}>
        <h3 className={styles.name}>{game.name}</h3>
        {game.shortDescription && (
          <p className={styles.desc}>{game.shortDescription.slice(0, 100)}...</p>
        )}
        <div className={styles.meta}>
          {ratio !== null && (
            <span className={ratio >= 70 ? styles.positive : styles.negative}>
              호감도 {ratio}%
            </span>
          )}
          {game.priceFinal != null && (
            <span className={styles.price}>
              {game.priceFinal === 0 ? '무료' : `₩${game.priceFinal.toLocaleString()}`}
            </span>
          )}
        </div>
        {game.genres?.length > 0 && (
          <div className={styles.tags}>
            {game.genres.slice(0, 3).map((g) => (
              <span key={g} className={styles.tag}>{g}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
