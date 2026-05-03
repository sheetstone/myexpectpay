import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { TOAST_AUTO_DISMISS_MS } from '../../constants'
import styles from './Toast.module.css'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
    const t = timers.current.get(id)
    if (t) { clearTimeout(t); timers.current.delete(id) }
  }, [])

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = crypto.randomUUID()
    setItems((prev) => [...prev, { id, message, variant }])
    const timer = setTimeout(() => dismiss(id), TOAST_AUTO_DISMISS_MS)
    timers.current.set(id, timer)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className={styles.container} aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className={`${styles.toast} ${styles[item.variant]}`} role="alert">
            <span className={styles.message}>{item.message}</span>
            <button className={styles.close} onClick={() => dismiss(item.id)} aria-label="Dismiss">
              <XMarkIcon width={16} height={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
