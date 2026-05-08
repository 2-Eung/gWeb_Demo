import { useState, useRef, useEffect } from 'react'
import { sendQuery } from '../api/game'
import styles from './Chat.module.css'

const SESSION_ID = `session_${Date.now()}`

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '안녕하세요! 게임에 대해 무엇이든 물어보세요.\n예: "FPS 게임 추천해줘", "엘든 링 어때?", "협동 게임 뭐가 있어?"' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await sendQuery(text, SESSION_ID)
      setMessages((prev) => [...prev, { role: 'assistant', text: res.answer ?? '응답을 받지 못했습니다.' }])
    } catch (err) {
      const detail = err?.response?.data?.message || err?.message || '알 수 없는 오류'
      setMessages((prev) => [...prev, { role: 'assistant', text: `오류: ${detail}`, error: true }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI 게임 분석</h1>
        <p className={styles.subtitle}>자연어로 질문하면 AI가 게임을 추천하고 분석합니다.</p>
      </div>

      <div className={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? styles.userMsg : `${styles.aiMsg}${m.error ? ' ' + styles.errorMsg : ''}`}>
            {m.role === 'assistant' && <span className={styles.aiLabel}>AI</span>}
            <p className={styles.msgText}>{m.text}</p>
          </div>
        ))}
        {loading && (
          <div className={styles.aiMsg}>
            <span className={styles.aiLabel}>AI</span>
            <p className={styles.thinking}>분석 중...</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          className={styles.textarea}
          placeholder="게임에 대해 질문하세요... (Enter로 전송, Shift+Enter 줄바꿈)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={2}
        />
        <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim() || loading}>
          전송
        </button>
      </div>
    </main>
  )
}
