"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useIntl } from "react-intl"
import { useQuery } from "@tanstack/react-query"
import { Spinner } from "@/components/ui"
import type { PaginatedResult, Recipient } from "@/types"
import formStyles from "./paymentForm.module.css"

const requestSchema = z.object({
  recipientId: z.string().optional(),
  recipientName: z.string().min(1, "Required").max(100),
  caseNumber: z.string().min(1, "Required"),
  amount: z.coerce.number().positive("Must be positive").max(999999),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
  note: z.string().max(500).optional(),
})

type RequestForm = z.infer<typeof requestSchema>

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

async function fetchRecipients(): Promise<PaginatedResult<Recipient>> {
  const res = await fetch("/api/recipients")
  if (!res.ok) throw new Error()
  return res.json()
}

export function RequestMoneyForm({ onSuccess, onCancel }: Props) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  const today = new Date().toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { paymentDate: today },
  })

  const { data: recipientsData } = useQuery({ queryKey: ["recipients"], queryFn: fetchRecipients, staleTime: 60_000 })
  const recipients = recipientsData?.items ?? []
  const selectedRecipientId = watch("recipientId")

  useEffect(() => {
    if (selectedRecipientId) {
      const r = recipients.find((r) => r.id === selectedRecipientId)
      if (r) setValue("recipientName", `${r.firstName} ${r.lastName}`)
    }
  }, [selectedRecipientId, recipients, setValue])

  const onSubmit = async (data: RequestForm) => {
    const res = await fetch("/api/payments/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: data.recipientId || undefined,
        recipientName: data.recipientName,
        caseNumber: data.caseNumber,
        amount: data.amount,
        paymentDate: data.paymentDate,
        note: data.note || undefined,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setError("root", { message: err?.error ?? t("common.error") })
      return
    }
    onSuccess()
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {errors.root && <p className={formStyles.formError}>{errors.root.message}</p>}

      <div className={formStyles.field}>
        <label className={formStyles.label} htmlFor="reqRecipientName">{t("payments.recipientName")}</label>
        <input
          id="reqRecipientName"
          type="text"
          className={`${formStyles.input} ${errors.recipientName ? formStyles.inputError : ""}`}
          {...register("recipientName")}
        />
        {errors.recipientName && <p className={formStyles.fieldError}>{errors.recipientName.message}</p>}
      </div>

      {recipients.length > 0 && (
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="reqRecipientId">{t("payments.selectRecipient")}</label>
          <select id="reqRecipientId" className={formStyles.select} {...register("recipientId")}>
            <option value="">—</option>
            {recipients.map((r) => (
              <option key={r.id} value={r.id}>
                {r.firstName} {r.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={formStyles.field}>
        <label className={formStyles.label} htmlFor="reqCaseNumber">{t("payments.caseNumber")}</label>
        <input
          id="reqCaseNumber"
          type="text"
          className={`${formStyles.input} ${errors.caseNumber ? formStyles.inputError : ""}`}
          {...register("caseNumber")}
        />
        {errors.caseNumber && <p className={formStyles.fieldError}>{errors.caseNumber.message}</p>}
      </div>

      <div className={formStyles.row}>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="reqAmount">{t("payments.amount")} ($)</label>
          <input
            id="reqAmount"
            type="number"
            min="0.01"
            step="0.01"
            className={`${formStyles.input} ${errors.amount ? formStyles.inputError : ""}`}
            {...register("amount")}
          />
          {errors.amount && <p className={formStyles.fieldError}>{errors.amount.message}</p>}
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="reqPaymentDate">{t("payments.paymentDate")}</label>
          <input
            id="reqPaymentDate"
            type="date"
            className={`${formStyles.input} ${errors.paymentDate ? formStyles.inputError : ""}`}
            {...register("paymentDate")}
          />
          {errors.paymentDate && <p className={formStyles.fieldError}>{errors.paymentDate.message}</p>}
        </div>
      </div>

      <div className={formStyles.field}>
        <label className={formStyles.label} htmlFor="reqNote">{t("payments.note")} (optional)</label>
        <textarea id="reqNote" rows={3} className={formStyles.textarea} {...register("note")} />
      </div>

      <div className={formStyles.actions}>
        <button type="button" className={formStyles.cancelBtn} onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button type="submit" className={formStyles.submitBtn} disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {t("payments.request")}
        </button>
      </div>
    </form>
  )
}
