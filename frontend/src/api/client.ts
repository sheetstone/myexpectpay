import { auth } from '../lib/firebase'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    throw new ApiError(401, 'Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new ApiError(res.status, body.error ?? `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
