import { useNavigate } from 'react-router-dom'
import styles from '../pages/Home.module.css'

/**
 * 홈 페이지에서 사용되는 기능 소개 카드 컴포넌트
 *
 * @component
 * @param {Object} props
 * @param {string} props.title - 서비스 제목
 * @param {string} props.desc - 서비스 상세 설명
 * @param {string} props.icon - 표시할 이모지 또는 아이콘
 * @param {string} props.to - 클릭 시 이동할 내부 경로
 * @returns {import('react').JSX.Element} FeatureCard 컴포넌트
 */
export default function FeatureCard({ title, desc, icon, to }) {
  const navigate = useNavigate()
  return (
    <button className={styles.featureCard} onClick={() => navigate(to)}>
      <span className={styles.featureIcon}>{icon}</span>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDesc}>{desc}</p>
    </button>
  )
}
