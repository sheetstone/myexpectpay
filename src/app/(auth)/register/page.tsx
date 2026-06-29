"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useIntl } from "react-intl"
import {
  createUserWithEmailAndPassword,
  updateProfile,
  AuthError,
} from "firebase/auth"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { auth } from "@/lib/firebase/client"
import { Spinner } from "@/components/ui"
import styles from "@/components/auth/authForm.module.css"

const registerSchema = z
  .object({
    displayName: z.string().min(2, "Display name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const intl = useIntl()
  const router = useRouter()
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setError("")
    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      await updateProfile(credential.user, { displayName: data.displayName })
      const idToken = await credential.user.getIdToken()
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })
      router.push("/")
    } catch (e) {
      const code = (e as AuthError).code
      if (code === "auth/email-already-in-use") {
        setError(intl.formatMessage({ id: "auth.emailAlreadyInUse" }))
      } else {
        setError(intl.formatMessage({ id: "common.error" }))
      }
    }
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.heading}>{intl.formatMessage({ id: "auth.register" })}</h1>
      <p className={styles.subtext}>
        {intl.formatMessage({ id: "auth.alreadyHaveAccount" })}{" "}
        <Link href="/login" className={styles.footerLink}>
          {intl.formatMessage({ id: "auth.signIn" })}
        </Link>
      </p>

      {error && <div className={styles.alert} role="alert">{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="displayName">
            {intl.formatMessage({ id: "auth.displayName" })}
          </label>
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            className={`${styles.input} ${errors.displayName ? styles.inputError : ""}`}
            {...register("displayName")}
          />
          {errors.displayName && (
            <p className={styles.fieldError}>{errors.displayName.message}</p>
          )}
        </div>

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
              autoComplete="new-password"
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

        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirmPassword">
            {intl.formatMessage({ id: "auth.confirmPassword" })}
          </label>
          <div className={styles.inputWrap}>
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              className={`${styles.input} ${styles.inputWithToggle} ${errors.confirmPassword ? styles.inputError : ""}`}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={intl.formatMessage({
                id: showConfirm ? "auth.hidePassword" : "auth.showPassword",
              })}
            >
              {showConfirm ? (
                <EyeSlashIcon width={16} height={16} />
              ) : (
                <EyeIcon width={16} height={16} />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className={styles.fieldError}>{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {intl.formatMessage({ id: "auth.signUp" })}
        </button>
      </form>
    </div>
  )
}
