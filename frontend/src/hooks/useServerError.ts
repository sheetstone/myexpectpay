import { useState, useCallback } from 'react'

export function useServerError() {
  const [error, setError] = useState('')
  const clearError = useCallback(() => setError(''), [])
  return { error, setError, clearError }
}
