"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useIntl } from "react-intl"
import type { Recipient, Case, PaginatedResult } from "@/types"
import { createRecipientSchema } from "@/lib/schemas/recipientSchema"
import type { z } from "zod"
import { Spinner } from "@/components/ui"
import fs from "@/components/shared/formStyles.module.css"

type FormValues = z.infer<typeof createRecipientSchema>

interface RecipientFormProps {
  recipient?: Recipient
  onSuccess: () => void
  onCancel: () => void
}

async function fetchAllCases(): Promise<Case[]> {
  const res = await fetch("/api/cases?limit=100")
  if (!res.ok) return []
  const data: PaginatedResult<Case> = await res.json()
  return data.items
}

export function RecipientForm({ recipient, onSuccess, onCancel }: RecipientFormProps) {
  const intl = useIntl()

  const { data: cases } = useQuery({
    queryKey: ["cases-all"],
    queryFn: fetchAllCases,
    staleTime: 120_000,
  })

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(createRecipientSchema),
    defaultValues: {
      firstName: recipient?.firstName ?? "",
      lastName: recipient?.lastName ?? "",
      email: recipient?.email ?? "",
      caseId: recipient?.caseId ?? "",
    },
  })

  async function onSubmit(values: FormValues) {
    const url = recipient ? `/api/recipients/${recipient.id}` : "/api/recipients"
    const method = recipient ? "PATCH" : "POST"
    const payload = { ...values, caseId: values.caseId || undefined }
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setError("root", { message: err.error ?? intl.formatMessage({ id: "common.error" }) })
      return
    }
    onSuccess()
  }

  const t = (id: string) => intl.formatMessage({ id })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {(errors as { root?: { message?: string } }).root && (
        <p className={fs.serverError}>{(errors as { root?: { message?: string } }).root?.message}</p>
      )}

      <div className={fs.field}>
        <label className={fs.label}>
          {t("recipients.firstName")}
          <input
            {...register("firstName")}
            className={`${fs.input} ${errors.firstName ? fs.inputError : ""}`}
            autoComplete="given-name"
          />
        </label>
        {errors.firstName && <p className={fs.fieldError}>{errors.firstName.message}</p>}
      </div>

      <div className={fs.field}>
        <label className={fs.label}>
          {t("recipients.lastName")}
          <input
            {...register("lastName")}
            className={`${fs.input} ${errors.lastName ? fs.inputError : ""}`}
            autoComplete="family-name"
          />
        </label>
        {errors.lastName && <p className={fs.fieldError}>{errors.lastName.message}</p>}
      </div>

      <div className={fs.field}>
        <label className={fs.label}>
          {t("recipients.email")}
          <input
            {...register("email")}
            type="email"
            className={`${fs.input} ${errors.email ? fs.inputError : ""}`}
            autoComplete="email"
          />
        </label>
        {errors.email && <p className={fs.fieldError}>{errors.email.message}</p>}
      </div>

      <div className={fs.field}>
        <label className={fs.label}>
          {t("recipients.linkedCase")}
          <select {...register("caseId")} className={fs.select}>
            <option value="">{t("recipients.noCase")}</option>
            {(cases ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} — {c.ncpName}
              </option>
            ))}
          </select>
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
