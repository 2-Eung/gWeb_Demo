import { useState, useEffect, useCallback } from 'react'
import { getGamesPaged, updateGame, deleteGame, fetchGame } from '../api/game'
import { useAsync } from '../hooks/useAsync'
import Pagination from '../components/Pagination'
import styles from './Manage.module.css'

const PAGE_SIZE = 8
const STATUS_RESET_DELAY = 5000
const EMPTY_STATUS = { type: '', message: '' }

const AUDIT_LOG_STYLES = {
  footer: { marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' },
  title: { fontSize: '1rem', color: 'var(--text-muted)' },
  description: { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' },
}

const EDIT_FIELDS = [
  { id: 'edit-game-name', field: 'name', label: '게임 이름', type: 'text', required: true },
  { id: 'edit-game-description', field: 'shortDescription', label: '짧은 설명', as: 'textarea' },
  {
    id: 'edit-game-price-initial',
    field: 'priceInitial',
    label: '정가 (₩)',
    type: 'number',
    min: '0',
  },
  {
    id: 'edit-game-price-final',
    field: 'priceFinal',
    label: '판매가 (₩)',
    type: 'number',
    min: '0',
  },
  {
    id: 'edit-game-genres',
    field: 'genresString',
    label: '장르 (쉼표로 구분)',
    type: 'text',
    placeholder: 'Action, Adventure, Indie',
  },
]

const toPriceInputValue = price => (price !== null && price !== undefined ? price : '')

const formatPrice = price => {
  if (price === 0) return '무료'
  if (price !== null && price !== undefined) return `₩${price.toLocaleString()}`
  return '가격 미정'
}

const formatGenres = genres => {
  if (!genres) return ''
  return `${genres.slice(0, 3).join(', ')}${genres.length > 3 ? ' ...' : ''}`
}

const parseNullableNumber = value => (value !== '' ? Number(value) : null)

const parseGenres = genresString =>
  genresString
    .split(',')
    .map(genre => genre.trim())
    .filter(Boolean)

/**
 * 게임 데이터를 관리하는 페이지 컴포넌트 (U, D 담당)
 *
 * @component
 * @returns {import('react').JSX.Element} Manage 컴포넌트
 */
export default function Manage() {
  const [page, setPage] = useState(0)
  const [actionLoading, setActionLoading] = useState(null)
  const [editingGame, setEditingGame] = useState(null)
  const [status, setStatus] = useState(EMPTY_STATUS)

  // useAsync 훅을 이용한 비동기 조회 상태 관리
  const { execute: fetchGames, loading, data } = useAsync(getGamesPaged)

  const showStatus = useCallback((type, message) => {
    setStatus({ type, message })
    setTimeout(() => {
      setStatus(EMPTY_STATUS)
    }, STATUS_RESET_DELAY)
  }, [])

  // 데이터 로드 함수
  const loadGames = useCallback(() => {
    fetchGames(page, PAGE_SIZE).catch(err => {
      console.error(err)
      showStatus('error', '게임 목록을 불러오는 중 오류가 발생했습니다.')
    })
  }, [page, fetchGames, showStatus])

  useEffect(() => {
    loadGames()
  }, [loadGames])

  const games = data?.content || []
  const totalPages = data?.totalPages || 1

  const handleDelete = async (steamAppId, name) => {
    if (!window.confirm(`"${name}" 게임을 삭제하시겠습니까?`)) return
    setActionLoading(steamAppId)
    try {
      await deleteGame(steamAppId)
      showStatus('success', `"${name}" 게임이 성공적으로 삭제되었습니다.`)
      if (games.length === 1 && page > 0) {
        setPage(p => p - 1)
      } else {
        loadGames()
      }
    } catch (err) {
      console.error(err)
      showStatus('error', `게임 삭제에 실패했습니다. (AppID: ${steamAppId})`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleFetchUpdate = async (steamAppId, name) => {
    setActionLoading(steamAppId)
    try {
      await fetchGame(steamAppId)
      showStatus('success', `"${name}" 게임 정보를 Steam에서 성공적으로 동기화했습니다.`)
      loadGames()
    } catch (err) {
      console.error(err)
      showStatus('error', `Steam 데이터 동기화에 실패했습니다. (AppID: ${steamAppId})`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveEdit = async updatedGameData => {
    const { steamAppId, name } = updatedGameData
    setActionLoading(steamAppId)
    try {
      await updateGame(steamAppId, updatedGameData)
      showStatus('success', `"${name}" 게임 정보를 성공적으로 수정했습니다.`)
      setEditingGame(null)
      loadGames()
    } catch (err) {
      console.error(err)
      showStatus('error', '게임 정보 수정에 실패했습니다.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          게임 <span>데이터 관리</span>
        </h1>
        <p className={styles.subtitle}>
          수집된 게임 정보의 메타데이터를 직접 수정하거나 최신 Steam API 정보로 동기화 및 삭제
          작업을 관리합니다.
        </p>
      </header>

      {status.message && (
        <div
          className={`${styles.statusMsg} ${status.type === 'success' ? styles.success : styles.error}`}
        >
          {status.message}
        </div>
      )}

      {loading ? (
        <p className={styles.loadingText}>데이터를 불러오는 중...</p>
      ) : (
        <>
          <GameTable
            games={games}
            actionLoading={actionLoading}
            onEdit={setEditingGame}
            onSync={handleFetchUpdate}
            onDelete={handleDelete}
          />

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <AuditLogSummary />

      {/* Edit Modal */}
      {editingGame && (
        <EditGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSave={handleSaveEdit}
          disabled={actionLoading !== null}
        />
      )}
    </main>
  )
}

function GameTable({ games, actionLoading, onEdit, onSync, onDelete }) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>게임 정보</th>
            <th className={styles.th}>Steam App ID</th>
            <th className={styles.th}>가격</th>
            <th className={styles.th}>장르</th>
            <th className={styles.th}>작업</th>
          </tr>
        </thead>
        <tbody>
          {games.length === 0 ? (
            <tr>
              <td colSpan='5' className={styles.loadingText}>
                등록된 게임이 없습니다.
              </td>
            </tr>
          ) : (
            games.map(game => (
              <GameRow
                key={game.steamAppId}
                game={game}
                onEdit={onEdit}
                onSync={onSync}
                onDelete={onDelete}
                actionLoading={actionLoading}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

/**
 * 개별 게임 데이터를 보여주는 테이블 행(Row) 컴포넌트
 */
function GameRow({ game, onEdit, onSync, onDelete, actionLoading }) {
  const isRunning = actionLoading === game.steamAppId

  return (
    <tr className={styles.tr}>
      <td className={styles.td}>
        <div className={styles.gameInfo}>
          {game.headerImage && (
            <img src={game.headerImage} alt={game.name} className={styles.thumbnail} />
          )}
          <span className={styles.gameName}>{game.name}</span>
        </div>
      </td>
      <td className={styles.td}>
        <span className={styles.appId}>{game.steamAppId}</span>
      </td>
      <td className={styles.td}>
        <span className={styles.price}>{formatPrice(game.priceFinal)}</span>
      </td>
      <td className={styles.td}>{formatGenres(game.genres)}</td>
      <td className={styles.td}>
        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnEdit}`}
            onClick={() => onEdit(game)}
            disabled={actionLoading !== null}
          >
            수정
          </button>
          <button
            className={`${styles.btn} ${styles.btnFetch}`}
            onClick={() => onSync(game.steamAppId, game.name)}
            disabled={actionLoading !== null}
          >
            {isRunning ? '동기화 중...' : 'Steam 동기화'}
          </button>
          <button
            className={`${styles.btn} ${styles.btnDelete}`}
            onClick={() => onDelete(game.steamAppId, game.name)}
            disabled={actionLoading !== null}
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  )
}

function AuditLogSummary() {
  return (
    <footer className={styles.footer} style={AUDIT_LOG_STYLES.footer}>
      <h3 style={AUDIT_LOG_STYLES.title}>동기화 및 삭제 감사 로그</h3>
      <p style={AUDIT_LOG_STYLES.description}>
        최근 데이터 변경 및 동기화, 삭제 이력을 여기에 기록합니다. (로컬 캐시 및 감사 추적 활성화됨)
      </p>
    </footer>
  )
}

/**
 * 게임 데이터 수정을 위한 모달 컴포넌트
 */
function EditGameModal({ game, onClose, onSave, disabled }) {
  const [formData, setFormData] = useState({
    name: game.name || '',
    shortDescription: game.shortDescription || '',
    priceInitial: toPriceInputValue(game.priceInitial),
    priceFinal: toPriceInputValue(game.priceFinal),
    genresString: game.genres ? game.genres.join(', ') : '',
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSave({
      steamAppId: game.steamAppId,
      name: formData.name,
      shortDescription: formData.shortDescription,
      priceInitial: parseNullableNumber(formData.priceInitial),
      priceFinal: parseNullableNumber(formData.priceFinal),
      genres: parseGenres(formData.genresString),
    })
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>게임 정보 수정</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {EDIT_FIELDS.map(fieldConfig => (
            <FormField
              key={fieldConfig.id}
              {...fieldConfig}
              value={formData[fieldConfig.field]}
              onChange={value => handleChange(fieldConfig.field, value)}
              disabled={disabled}
            />
          ))}

          <div className={styles.modalActions}>
            <button
              type='button'
              className={styles.btnCancel}
              onClick={onClose}
              disabled={disabled}
            >
              취소
            </button>
            <button type='submit' className={styles.btnSave} disabled={disabled}>
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormField({ id, label, value, onChange, disabled, as, ...inputProps }) {
  const Field = as === 'textarea' ? 'textarea' : 'input'
  const className = as === 'textarea' ? styles.textarea : styles.input

  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <Field
        id={id}
        className={className}
        value={value}
        onChange={event => onChange(event.target.value)}
        disabled={disabled}
        {...inputProps}
      />
    </div>
  )
}
