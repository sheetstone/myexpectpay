import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { apiFetch } from '../api/client'
import type { AuthUser } from '../types/api'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
    setUser(null)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken()
          const dbUser = await apiFetch<AuthUser>('/auth/verify', {
            method: 'POST',
            body: JSON.stringify({ idToken }),
          })
          setUser(dbUser)
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    const handleUnauthorized = () => { void signOut() }
    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      unsubscribe()
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [signOut])

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider)
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
