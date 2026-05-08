import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

const NAV = [
  { to: '/', label: '홈' },
  { to: '/search', label: '게임 검색' },
  { to: '/fetch', label: '게임 등록' },
  { to: '/chat', label: 'AI 분석' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoAccent}>g</span>Web2
      </Link>
      <ul className={styles.links}>
        {NAV.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className={pathname === to ? `${styles.link} ${styles.active}` : styles.link}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
