"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useIntl } from "react-intl"
import { sendPasswordResetEmail, AuthError } from "firebase/auth"
import { CheckCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"
import { auth } from "@/lib/firebase/client"
import { Spinner } from "@/components/ui"
import styles from "@/components/auth/authForm.module.css"

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const intl = useIntl()
  const [error, setError] = useState("")
  const [sentTo, setSentTo] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotForm) => {
    setError("")
    try {
      await sendPasswordResetEmail(auth, data.email)
      setSentTo(data.email)
    } catch (e) {
      const code = (e as AuthError).code
      if (code === "auth/user-not-found") {
        // Don't reveal whether the email exists — show success anyway
        setSentTo(data.email)
      } else {
        setError(intl.formatMessage({ id: "common.error" }))
      }
    }
  }

  if (sentTo) {
    return (
      <div className={`${styles.card} ${styles.successCard}`}>
        <CheckCircleIcon className={styles.successIcon} />
        <h1 className={styles.successTitle}>
          {intl.formatMessage({ id: "auth.checkYourEmail" })}
        </h1>
        <p className={styles.successDesc}>
          {intl.formatMessage({ id: "auth.checkYourEmailDesc" }, { email: sentTo })}
        </p>
        <Link href="/login" className={styles.backLink}>
          <ArrowLeftIcon width={14} height={14} />
          {intl.formatMessage({ id: "auth.backToLogin" })}
        </Link>
        <button type="button" className={styles.tryLink} onClick={() => setSentTo("")}>
          {intl.formatMessage({ id: "auth.sendResetLink" })} again
        </button>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.heading}>
        {intl.formatMessage({ id: "auth.forgotPasswordTitle" })}
      </h1>
      <p className={styles.subtext}>
        {intl.formatMessage({ id: "auth.forgotPasswordDesc" })}
      </p>

      {error && (
        <div className={styles.alert} role="alert">
          {error}
        </div>
      )}

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

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {intl.formatMessage({ id: "auth.sendResetLink" })}
        </button>
      </form>

      <p className={styles.footer}>
        <Link href="/login" className={styles.backLink}>
          <ArrowLeftIcon width={14} height={14} />
          {intl.formatMessage({ id: "auth.backToLogin" })}
        </Link>
      </p>
    </div>
  )
}
