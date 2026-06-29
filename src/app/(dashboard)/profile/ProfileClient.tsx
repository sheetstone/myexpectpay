"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useIntl } from "react-intl"
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth"
import { auth } from "@/lib/firebase/client"
import { useAuth } from "@/components/providers/AuthProvider"
import { Spinner, useToast } from "@/components/ui"
import styles from "./profile.module.css"

const profileSchema = z.object({
  displayName: z.string().min(2).max(100),
})
type ProfileForm = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Min 8 characters"),
    confirmNewPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
type PasswordForm = z.infer<typeof passwordSchema>

export function ProfileClient() {
  const intl = useIntl()
  const { user } = useAuth()
  const toast = useToast()
  const [profileError, setProfileError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const t = (id: string) => intl.formatMessage({ id })

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.displayName ?? "" },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onUpdateProfile = async (data: ProfileForm) => {
    setProfileError("")
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: data.displayName }),
      })
      if (!res.ok) throw new Error("Update failed")
      toast.toast(t("profile.updateSuccess"), "success")
    } catch {
      setProfileError(t("common.error"))
    }
  }

  const onChangePassword = async (data: PasswordForm) => {
    setPasswordError("")
    const currentUser = auth.currentUser
    if (!currentUser?.email) {
      setPasswordError(t("common.error"))
      return
    }
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword)
      await reauthenticateWithCredential(currentUser, credential)
      await updatePassword(currentUser, data.newPassword)
      passwordForm.reset()
      toast.toast(t("profile.passwordSuccess"), "success")
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setPasswordError(t("profile.wrongCurrentPassword"))
      } else {
        setPasswordError(t("common.error"))
      }
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <h1>{t("profile.title")}</h1>
      </div>

      <div className={styles.grid}>
        {/* Profile info card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t("profile.displayName")}</h2>
          {profileError && <p className={styles.errorMsg}>{profileError}</p>}
          <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="displayName">
                {t("profile.displayName")}
              </label>
              <input
                id="displayName"
                type="text"
                className={`${styles.input} ${profileForm.formState.errors.displayName ? styles.inputError : ""}`}
                {...profileForm.register("displayName")}
              />
              {profileForm.formState.errors.displayName && (
                <p className={styles.fieldError}>{profileForm.formState.errors.displayName.message}</p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={`${styles.input} ${styles.inputDisabled}`}
                value={user?.email ?? ""}
                disabled
                readOnly
              />
            </div>

            <button
              type="submit"
              className={styles.saveBtn}
              disabled={profileForm.formState.isSubmitting}
            >
              {profileForm.formState.isSubmitting && <Spinner />}
              {t("profile.updateProfile")}
            </button>
          </form>
        </div>

        {/* Password card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t("profile.changePassword")}</h2>
          {passwordError && <p className={styles.errorMsg}>{passwordError}</p>}
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="currentPassword">
                {t("profile.currentPassword")}
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                className={`${styles.input} ${passwordForm.formState.errors.currentPassword ? styles.inputError : ""}`}
                {...passwordForm.register("currentPassword")}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className={styles.fieldError}>{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="newPassword">
                {t("profile.newPassword")}
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className={`${styles.input} ${passwordForm.formState.errors.newPassword ? styles.inputError : ""}`}
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className={styles.fieldError}>{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirmNewPassword">
                {t("profile.confirmNewPassword")}
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                autoComplete="new-password"
                className={`${styles.input} ${passwordForm.formState.errors.confirmNewPassword ? styles.inputError : ""}`}
                {...passwordForm.register("confirmNewPassword")}
              />
              {passwordForm.formState.errors.confirmNewPassword && (
                <p className={styles.fieldError}>{passwordForm.formState.errors.confirmNewPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              className={styles.saveBtn}
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting && <Spinner />}
              {t("profile.changePassword")}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
