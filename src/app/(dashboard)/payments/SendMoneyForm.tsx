"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useIntl } from "react-intl"
import { useQuery } from "@tanstack/react-query"
import { Spinner } from "@/components/ui"
import type { BankAccount, PaginatedResult, Recipient } from "@/types"
import formStyles from "./paymentForm.module.css"

const sendSchema = z.object({
  bankId: z.string().min(1, "Required"),
  recipientId: z.string().optional(),
  recipientName: z.string().min(1, "Required").max(100),
  caseNumber: z.string().min(1, "Required"),
  amount: z.coerce.number().positive("Must be positive").max(999999),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
  note: z.string().max(500).optional(),
})

type SendForm = z.infer<typeof sendSchema>

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

async function fetchBanks(): Promise<PaginatedResult<BankAccount>> {
  const res = await fetch("/api/banks")
  if (!res.ok) throw new Error()
  return res.json()
}

async function fetchRecipients(): Promise<PaginatedResult<Recipient>> {
  const res = await fetch("/api/recipients")
  if (!res.ok) throw new Error()
  return res.json()
}

export function SendMoneyForm({ onSuccess, onCancel }: Props) {
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
  } = useForm<SendForm>({
    resolver: zodResolver(sendSchema),
    defaultValues: { paymentDate: today },
  })

  const { data: banksData } = useQuery({ queryKey: ["banks"], queryFn: fetchBanks, staleTime: 60_000 })
  const { data: recipientsData } = useQuery({ queryKey: ["recipients"], queryFn: fetchRecipients, staleTime: 60_000 })

  const banks = banksData?.items.filter((b) => b.verified && b.sendPayments) ?? []
  const recipients = recipientsData?.items ?? []

  const selectedRecipientId = watch("recipientId")

  useEffect(() => {
    if (selectedRecipientId) {
      const r = recipients.find((r) => r.id === selectedRecipientId)
      if (r) setValue("recipientName", `${r.firstName} ${r.lastName}`)
    }
  }, [selectedRecipientId, recipients, setValue])

  const onSubmit = async (data: SendForm) => {
    const res = await fetch("/api/payments/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bankId: data.bankId,
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
        <label className={formStyles.label} htmlFor="bankId">{t("payments.bank")}</label>
        <select
          id="bankId"
          className={`${formStyles.select} ${errors.bankId ? formStyles.inputError : ""}`}
          {...register("bankId")}
        >
          <option value="">{t("payments.selectBank")}</option>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nickname ?? b.bankName} (····{b.accountNumberLast4})
            </option>
          ))}
        </select>
        {errors.bankId && <p className={formStyles.fieldError}>{errors.bankId.message}</p>}
      </div>

      <div className={formStyles.field}>
        <label className={formStyles.label} htmlFor="recipientName">{t("payments.recipientName")}</label>
        <input
          id="recipientName"
          type="text"
          className={`${formStyles.input} ${errors.recipientName ? formStyles.inputError : ""}`}
          {...register("recipientName")}
        />
        {errors.recipientName && <p className={formStyles.fieldError}>{errors.recipientName.message}</p>}
      </div>

      {recipients.length > 0 && (
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="recipientId">{t("payments.selectRecipient")}</label>
          <select
            id="recipientId"
            className={formStyles.select}
            {...register("recipientId")}
          >
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
        <label className={formStyles.label} htmlFor="caseNumber">{t("payments.caseNumber")}</label>
        <input
          id="caseNumber"
          type="text"
          className={`${formStyles.input} ${errors.caseNumber ? formStyles.inputError : ""}`}
          {...register("caseNumber")}
        />
        {errors.caseNumber && <p className={formStyles.fieldError}>{errors.caseNumber.message}</p>}
      </div>

      <div className={formStyles.row}>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="amount">{t("payments.amount")} ($)</label>
          <input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            className={`${formStyles.input} ${errors.amount ? formStyles.inputError : ""}`}
            {...register("amount")}
          />
          {errors.amount && <p className={formStyles.fieldError}>{errors.amount.message}</p>}
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="paymentDate">{t("payments.paymentDate")}</label>
          <input
            id="paymentDate"
            type="date"
            className={`${formStyles.input} ${errors.paymentDate ? formStyles.inputError : ""}`}
            {...register("paymentDate")}
          />
          {errors.paymentDate && <p className={formStyles.fieldError}>{errors.paymentDate.message}</p>}
        </div>
      </div>

      <div className={formStyles.field}>
        <label className={formStyles.label} htmlFor="note">{t("payments.note")} (optional)</label>
        <textarea
          id="note"
          rows={3}
          className={formStyles.textarea}
          {...register("note")}
        />
      </div>

      <div className={formStyles.actions}>
        <button type="button" className={formStyles.cancelBtn} onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button type="submit" className={formStyles.submitBtn} disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {t("payments.send")}
        </button>
      </div>
    </form>
  )
}
