"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useIntl } from "react-intl"
import type { Case } from "@/types"
import { createCaseSchema } from "@/lib/schemas/caseSchema"
import type { z } from "zod"
import { Spinner } from "@/components/ui"
import fs from "@/components/shared/formStyles.module.css"

type FormValues = z.infer<typeof createCaseSchema>

interface CaseFormProps {
  caseItem?: Case
  onSuccess: () => void
  onCancel: () => void
}

export function CaseForm({ caseItem, onSuccess, onCancel }: CaseFormProps) {
  const intl = useIntl()

  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      caseNumber: caseItem?.caseNumber ?? "",
      ncpName: caseItem?.ncpName ?? "",
      children: caseItem?.children.length ? caseItem.children.map((c) => c) : [""],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "children" as never })

  async function onSubmit(values: FormValues) {
    const url = caseItem ? `/api/cases/${caseItem.id}` : "/api/cases"
    const method = caseItem ? "PATCH" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, children: values.children.filter(Boolean) }),
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
          {t("cases.caseNumber")}
          <input
            {...register("caseNumber")}
            className={`${fs.input} ${errors.caseNumber ? fs.inputError : ""}`}
            placeholder="AB-12345"
          />
        </label>
        {errors.caseNumber && (
          <p className={fs.fieldError}>{errors.caseNumber.message ?? t("cases.invalidCaseNumber")}</p>
        )}
      </div>

      <div className={fs.field}>
        <label className={fs.label}>
          {t("cases.ncpName")}
          <input
            {...register("ncpName")}
            className={`${fs.input} ${errors.ncpName ? fs.inputError : ""}`}
          />
        </label>
        {errors.ncpName && (
          <p className={fs.fieldError}>{errors.ncpName.message}</p>
        )}
      </div>

      <div className={fs.field}>
        <fieldset className={fs.fieldset}>
          <legend className={fs.legend}>{t("cases.children")}</legend>
          {(fields as { id: string }[]).map((field, idx) => (
            <div key={field.id} className={fs.childRow}>
              <input
                {...register(`children.${idx}`)}
                className={fs.input}
                placeholder={`Child ${idx + 1}`}
              />
              {fields.length > 1 && (
                <button type="button" className={fs.removeBtn} onClick={() => remove(idx)} aria-label="Remove">
                  &times;
                </button>
              )}
            </div>
          ))}
          <button type="button" className={fs.addChildBtn} onClick={() => append("")}>
            + {t("cases.addChild")}
          </button>
        </fieldset>
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
