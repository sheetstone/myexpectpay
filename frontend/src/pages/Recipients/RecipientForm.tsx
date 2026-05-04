import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useIntl } from 'react-intl'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { recipientsApi } from '../../api/recipientsApi'
import { casesApi } from '../../api/casesApi'
import type { Recipient } from '../../types/api'
import { Modal, Spinner, useToast } from '../../components/ui'
import styles from './RecipientForm.module.css'

interface RecipientFormProps {
  recipient: Recipient | 'new' | null
  onClose: () => void
}

interface FormFields {
  firstName: string
  lastName: string
  email: string
  caseId: string
}

function buildSchema(fmt: (id: string) => string) {
  return yup.object({
    firstName: yup.string().required(fmt('recipients.firstName')),
    lastName: yup.string().required(fmt('recipients.lastName')),
    email: yup
      .string()
      .required(fmt('recipients.email'))
      .email(fmt('recipients.email')),
    caseId: yup.string().defined(),
  })
}

export function RecipientForm({ recipient, onClose }: RecipientFormProps) {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [serverError, setServerError] = useState('')

  const isNew = recipient === 'new'
  const isEdit = recipient !== null && recipient !== 'new'

  const { data: casesData } = useQuery({
    queryKey: ['cases-dropdown'],
    queryFn: () => casesApi.list(1, 100),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: yupResolver(buildSchema(fmt)),
    defaultValues: { firstName: '', lastName: '', email: '', caseId: '' },
  })

  useEffect(() => {
    if (isEdit) {
      reset({
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        email: recipient.email,
        caseId: recipient.caseId ?? '',
      })
    } else if (isNew) {
      reset({ firstName: '', lastName: '', email: '', caseId: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipient])

  async function onSubmit(data: FormFields) {
    setServerError('')
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      ...(data.caseId ? { caseId: data.caseId } : {}),
    }
    try {
      if (isNew) {
        await recipientsApi.create(payload)
      } else if (isEdit) {
        await recipientsApi.update(recipient.id, payload)
      }
      await queryClient.invalidateQueries({ queryKey: ['recipients'] })
      toast(fmt('common.saveSuccess'), 'success')
      onClose()
    } catch {
      setServerError(fmt('common.error'))
    }
  }

  const title = isNew ? fmt('recipients.addTitle') : fmt('recipients.edit')

  return (
    <Modal open={recipient !== null} title={title} onClose={onClose}>
      <form
        className={styles.form}
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        noValidate
      >
        <label className={styles.label}>
          {fmt('recipients.firstName')}
          <input
            type="text"
            className={`${styles.input}${errors.firstName ? ` ${styles.inputError}` : ''}`}
            {...register('firstName')}
          />
          {errors.firstName && (
            <span className={styles.fieldError}>{errors.firstName.message}</span>
          )}
        </label>

        <label className={styles.label}>
          {fmt('recipients.lastName')}
          <input
            type="text"
            className={`${styles.input}${errors.lastName ? ` ${styles.inputError}` : ''}`}
            {...register('lastName')}
          />
          {errors.lastName && (
            <span className={styles.fieldError}>{errors.lastName.message}</span>
          )}
        </label>

        <label className={styles.label}>
          {fmt('recipients.email')}
          <input
            type="email"
            inputMode="email"
            className={`${styles.input}${errors.email ? ` ${styles.inputError}` : ''}`}
            {...register('email')}
          />
          {errors.email && (
            <span className={styles.fieldError}>{errors.email.message}</span>
          )}
        </label>

        <label className={styles.label}>
          {fmt('recipients.linkedCase')}
          <select
            className={styles.select}
            {...register('caseId')}
          >
            <option value="">—</option>
            {casesData?.items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} — {c.ncpName}
              </option>
            ))}
          </select>
        </label>

        {serverError && (
          <p className={styles.serverError} role="alert">
            {serverError}
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            {fmt('common.cancel')}
          </button>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : fmt('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
