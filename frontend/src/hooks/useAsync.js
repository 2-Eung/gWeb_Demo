import { useState, useCallback, useRef } from 'react'
import { DEFAULT_ERROR_MESSAGE } from '../constants'

/**
 * 비동기 작업을 처리하기 위한 커스텀 훅
 *
 * @param {Function} asyncFunction - 실행할 비동기 함수
 * @returns {Object} { execute, loading, data, error, setData, setError }
 */
export const useAsync = asyncFunction => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const lastCallId = useRef(0)

  const execute = useCallback(
    async (...args) => {
      const callId = ++lastCallId.current
      setLoading(true)
      setError(null)
      try {
        const response = await asyncFunction(...args)
        if (callId === lastCallId.current) {
          setData(response)
        }
        return response
      } catch (err) {
        if (callId === lastCallId.current) {
          const message = err?.response?.data?.message || err?.message || DEFAULT_ERROR_MESSAGE
          setError(message)
        }
        throw err
      } finally {
        if (callId === lastCallId.current) {
          setLoading(false)
        }
      }
    },
    [asyncFunction]
  )

  return { execute, loading, data, error, setData, setError }
}
