"use client"

import { useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useIntl } from "react-intl"
import type { BankAccount } from "@/types"
import { createBankSchema, updateBankSchema } from "@/lib/schemas/bankSchema"
import type { z } from "zod"
import { Spinner } from "@/components/ui"
import { validateRouting } from "@/utils/validateRouting"
import { ROUTING_LOOKUP_DEBOUNCE_MS } from "@/constants"
import fs from "@/components/shared/formStyles.module.css"

type CreateValues = z.infer<typeof createBankSchema>
type UpdateValues = z.infer<typeof updateBankSchema>

interface BankAccountFormProps {
  account?: BankAccount
  onSuccess: () => void
  onCancel: () => void
}

export function BankAccountForm({ account, onSuccess, onCancel }: BankAccountFormProps) {
  const intl = useIntl()
  const isEdit = Boolean(account)

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createBankSchema),
    defaultValues: {
      bankName: "",
      routingNumber: "",
      accountNumber: "",
      confirmAccountNumber: "",
      accountType: "checking",
      nickname: "",
    },
  })

  const updateForm = useForm<UpdateValues>({
    resolver: zodResolver(updateBankSchema),
    defaultValues: {
      accountType: account?.accountType ?? "checking",
      nickname: account?.nickname ?? "",
    },
  })

  const form = isEdit ? updateForm : createForm
  const { formState: { isSubmitting, errors } } = form

  const lookupDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleRoutingBlur(routing: string) {
    if (!validateRouting(routing)) return
    if (lookupDebounceRef.current) clearTimeout(lookupDebounceRef.current)
    lookupDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/banks/lookup/${routing}`)
        if (!res.ok) throw new Error("Lookup failed")
        const result: { bankName: string } = await res.json()
        createForm.setValue("bankName", result.bankName, { shouldValidate: true })
      } catch {
        createForm.setValue("bankName", "", { shouldValidate: false })
      }
    }, ROUTING_LOOKUP_DEBOUNCE_MS)
  }

  async function onSubmit(values: CreateValues | UpdateValues) {
    const url = account ? `/api/banks/${account.id}` : "/api/banks"
    const method = account ? "PATCH" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      form.setError("root", { message: err.error ?? intl.formatMessage({ id: "common.error" }) })
      return
    }
    onSuccess()
  }

  const t = (id: string) => intl.formatMessage({ id })

  return (
    <form onSubmit={form.handleSubmit(onSubmit as never)} noValidate>
      {(errors as { root?: { message?: string } }).root && (
        <p className={fs.serverError}>{(errors as { root?: { message?: string } }).root?.message}</p>
      )}

      {!isEdit && (
        <>
          <div className={fs.field}>
            <label className={fs.label}>
              {t("bankAccount.routingNumber")}
              <input
                {...createForm.register("routingNumber")}
                onBlur={(e) => handleRoutingBlur(e.target.value)}
                className={`${fs.input} ${createForm.formState.errors.routingNumber ? fs.inputError : ""}`}
                inputMode="numeric"
                maxLength={9}
              />
            </label>
            {createForm.formState.errors.routingNumber && (
              <p className={fs.fieldError}>{createForm.formState.errors.routingNumber.message ?? t("bankAccount.invalidRouting")}</p>
            )}
          </div>

          <div className={fs.field}>
            <label className={fs.label}>
              {t("bankAccount.bankName")}
              <input
                {...(createForm.register("bankName"))}
                readOnly
                className={`${fs.input} ${fs.readOnly} ${createForm.formState.errors.bankName ? fs.inputError : ""}`}
              />
            </label>
            {createForm.formState.errors.bankName && (
              <p className={fs.fieldError}>{createForm.formState.errors.bankName.message}</p>
            )}
          </div>

          <div className={fs.field}>
            <label className={fs.label}>
              {t("bankAccount.accountNumber")}
              <input
                {...createForm.register("accountNumber")}
                type="password"
                autoComplete="new-password"
                className={`${fs.input} ${createForm.formState.errors.accountNumber ? fs.inputError : ""}`}
              />
            </label>
            {createForm.formState.errors.accountNumber && (
              <p className={fs.fieldError}>{createForm.formState.errors.accountNumber.message}</p>
            )}
          </div>

          <div className={fs.field}>
            <label className={fs.label}>
              {t("bankAccount.confirmAccountNumber")}
              <input
                {...createForm.register("confirmAccountNumber")}
                type="password"
                autoComplete="new-password"
                className={`${fs.input} ${createForm.formState.errors.confirmAccountNumber ? fs.inputError : ""}`}
              />
            </label>
            {createForm.formState.errors.confirmAccountNumber && (
              <p className={fs.fieldError}>{createForm.formState.errors.confirmAccountNumber.message ?? t("bankAccount.accountNumberMismatch")}</p>
            )}
          </div>
        </>
      )}

      <div className={fs.field}>
        <label className={fs.label}>
          {t("bankAccount.accountType")}
          <select
            {...(isEdit ? updateForm.register("accountType") : createForm.register("accountType"))}
            className={fs.select}
          >
            <option value="checking">{t("bankAccount.checking")}</option>
            <option value="saving">{t("bankAccount.saving")}</option>
          </select>
        </label>
      </div>

      <div className={fs.field}>
        <label className={fs.label}>
          {t("bankAccount.nickname")}
          <input
            {...(isEdit ? updateForm.register("nickname") : createForm.register("nickname"))}
            className={fs.input}
            placeholder={t("bankAccount.nicknameHint")}
          />
        </label>
      </div>

      <div className={fs.actions}>
        <button type="button" className={fs.cancelBtn} onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button type="submit" className={fs.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : t("common.save")}
        </button>
      </div>
    </form>
  )
}
