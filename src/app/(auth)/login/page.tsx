"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useIntl } from "react-intl"
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError,
} from "firebase/auth"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { auth } from "@/lib/firebase/client"
import { Spinner } from "@/components/ui"
import styles from "@/components/auth/authForm.module.css"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Required"),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

const googleProvider = new GoogleAuthProvider()

export default function LoginPage() {
  const intl = useIntl()
  const router = useRouter()
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function setSessionCookie(idToken: string) {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    })
  }

  const onSubmit = async (data: LoginForm) => {
    setError("")
    try {
      const credential = await signInWithEmailAndPassword(auth, data.email, data.password)
      const idToken = await credential.user.getIdToken()
      await setSessionCookie(idToken)
      router.push("/")
    } catch (e) {
      const code = (e as AuthError).code
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError(intl.formatMessage({ id: "auth.wrongCredentials" }))
      } else if (code === "auth/user-not-found") {
        setError(intl.formatMessage({ id: "auth.userNotFound" }))
      } else {
        setError(intl.formatMessage({ id: "common.error" }))
      }
    }
  }

  const handleGoogle = async () => {
    setError("")
    setGoogleLoading(true)
    try {
      const credential = await signInWithPopup(auth, googleProvider)
      const idToken = await credential.user.getIdToken()
      await setSessionCookie(idToken)
      router.push("/")
    } catch (e) {
      const code = (e as AuthError).code
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setError(intl.formatMessage({ id: "common.error" }))
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.heading}>{intl.formatMessage({ id: "auth.welcome" })}</h1>
      <p className={styles.subtext}>
        {intl.formatMessage({ id: "auth.signInWithEmail" })} or use Google.
      </p>

      <button
        type="button"
        className={styles.googleBtn}
        onClick={handleGoogle}
        disabled={googleLoading || isSubmitting}
      >
        {googleLoading ? (
          <Spinner />
        ) : (
          <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {intl.formatMessage({ id: "auth.signInWithGoogle" })}
      </button>

      <div className={styles.divider}>{intl.formatMessage({ id: "auth.orSeparator" })}</div>

      {error && <div className={styles.alert} role="alert">{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            {intl.formatMessage({ id: "auth.email" })}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            {...register("email")}
          />
          {errors.email && (
            <p className={styles.fieldError}>{errors.email.message}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            {intl.formatMessage({ id: "auth.password" })}
          </label>
          <div className={styles.inputWrap}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={`${styles.input} ${styles.inputWithToggle} ${errors.password ? styles.inputError : ""}`}
              {...register("password")}
            />
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={intl.formatMessage({
                id: showPassword ? "auth.hidePassword" : "auth.showPassword",
              })}
            >
              {showPassword ? (
                <EyeSlashIcon width={16} height={16} />
              ) : (
                <EyeIcon width={16} height={16} />
              )}
            </button>
          </div>
          {errors.password && (
            <p className={styles.fieldError}>{errors.password.message}</p>
          )}
        </div>

        <div className={styles.checkRow}>
          <label className={styles.checkLabel}>
            <input type="checkbox" className={styles.checkbox} {...register("rememberMe")} />
            {intl.formatMessage({ id: "auth.rememberMe" })}
          </label>
          <Link href="/forgot-password" className={styles.forgotLink}>
            {intl.formatMessage({ id: "auth.forgotPassword" })}
          </Link>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting || googleLoading}
        >
          {isSubmitting && <Spinner />}
          {intl.formatMessage({ id: "auth.signIn" })}
        </button>
      </form>

      <p className={styles.footer}>
        {intl.formatMessage({ id: "auth.newUser" })}{" "}
        <Link href="/register" className={styles.footerLink}>
          {intl.formatMessage({ id: "auth.signUp" })}
        </Link>
      </p>
    </div>
  )
}
