import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useIntl } from 'react-intl'
import { useQueryClient } from '@tanstack/react-query'
import { banksApi } from '../../api/banksApi'
import { validateRouting } from '../../utils/validateRouting'
import { ROUTING_LOOKUP_DEBOUNCE_MS } from '../../constants'
import type { AccountType, BankAccount } from '../../types/api'
import { Modal, Spinner, useToast } from '../../components/ui'
import styles from './BankAccountForm.module.css'

interface BankAccountFormProps {
  bank: BankAccount | 'new' | null
  onClose: () => void
}

interface AddFields {
  routingNumber: string
  bankName: string
  accountNumber: string
  confirmAccountNumber: string
  accountType: AccountType
  nickname: string
}

interface EditFields {
  accountType: AccountType
  nickname: string
}

function buildAddSchema(fmt: (id: string) => string) {
  return yup.object({
    routingNumber: yup
      .string()
      .required(fmt('bankAccount.routingNumber'))
      .test('aba', fmt('bankAccount.invalidRouting'), (v) => validateRouting(v ?? '')),
    bankName: yup.string().required(fmt('bankAccount.bankName')),
    accountNumber: yup.string().required(fmt('bankAccount.accountNumber')),
    confirmAccountNumber: yup
      .string()
      .required(fmt('bankAccount.confirmAccountNumber'))
      .oneOf([yup.ref('accountNumber')], fmt('bankAccount.accountNumberMismatch')),
    accountType: yup
      .mixed<AccountType>()
      .oneOf(['checking', 'saving'])
      .required(fmt('bankAccount.accountType')),
    nickname: yup.string().max(60).optional().default(''),
  })
}

function buildEditSchema(fmt: (id: string) => string) {
  return yup.object({
    accountType: yup
      .mixed<AccountType>()
      .oneOf(['checking', 'saving'])
      .required(fmt('bankAccount.accountType')),
    nickname: yup.string().max(60).optional().default(''),
  })
}

export function BankAccountForm({ bank, onClose }: BankAccountFormProps) {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [serverError, setServerError] = useState('')
  const isNew = bank === 'new'
  const isEdit = bank !== null && bank !== 'new'

  const addForm = useForm<AddFields>({
    resolver: yupResolver(buildAddSchema(fmt)),
    defaultValues: { routingNumber: '', bankName: '', accountNumber: '', confirmAccountNumber: '', accountType: 'checking', nickname: '' },
  })

  const editForm = useForm<EditFields>({
    resolver: yupResolver(buildEditSchema(fmt)),
    defaultValues: { accountType: isEdit ? bank.accountType : 'checking', nickname: isEdit ? (bank.nickname ?? '') : '' },
  })

  useEffect(() => {
    if (isEdit) {
      editForm.reset({ accountType: bank.accountType, nickname: bank.nickname ?? '' })
    }
    if (isNew) {
      addForm.reset({ routingNumber: '', bankName: '', accountNumber: '', confirmAccountNumber: '', accountType: 'checking', nickname: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bank])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleRoutingBlur(routing: string) {
    if (!validateRouting(routing)) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await banksApi.lookup(routing)
        addForm.setValue('bankName', result.bankName, { shouldValidate: false })
      } catch {
        addForm.setValue('bankName', '', { shouldValidate: false })
      }
    }, ROUTING_LOOKUP_DEBOUNCE_MS)
  }

  async function onAddSubmit(data: AddFields) {
    setServerError('')
    try {
      await banksApi.create({
        bankName: data.bankName,
        routingNumber: data.routingNumber,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        nickname: data.nickname || undefined,
      })
      await queryClient.invalidateQueries({ queryKey: ['banks'] })
      toast(fmt('common.saveSuccess'), 'success')
      onClose()
    } catch {
      setServerError(fmt('common.error'))
    }
  }

  async function onEditSubmit(data: EditFields) {
    if (!isEdit) return
    setServerError('')
    try {
      await banksApi.update(bank.id, { accountType: data.accountType, nickname: data.nickname || null })
      await queryClient.invalidateQueries({ queryKey: ['banks'] })
      toast(fmt('common.saveSuccess'), 'success')
      onClose()
    } catch {
      setServerError(fmt('common.error'))
    }
  }

  const title = isNew ? fmt('bankAccount.addTitle') : fmt('bankAccount.edit')

  return (
    <Modal open={bank !== null} title={title} onClose={onClose}>
      {isNew && (
        <form
          className={styles.form}
          onSubmit={(e) => void addForm.handleSubmit(onAddSubmit)(e)}
          noValidate
        >
          <label className={styles.label}>
            {fmt('bankAccount.routingNumber')}
            <input
              type="text"
              inputMode="numeric"
              maxLength={9}
              className={`${styles.input}${addForm.formState.errors.routingNumber ? ` ${styles.inputError}` : ''}`}
              {...addForm.register('routingNumber')}
              onBlur={(e) => handleRoutingBlur(e.target.value)}
            />
            {addForm.formState.errors.routingNumber && (
              <span className={styles.fieldError}>{addForm.formState.errors.routingNumber.message}</span>
            )}
          </label>

          <label className={styles.label}>
            {fmt('bankAccount.bankName')}
            <input
              type="text"
              readOnly
              className={`${styles.input} ${styles.readOnly}`}
              {...addForm.register('bankName')}
            />
            {addForm.formState.errors.bankName && (
              <span className={styles.fieldError}>{addForm.formState.errors.bankName.message}</span>
            )}
          </label>

          <label className={styles.label}>
            {fmt('bankAccount.accountNumber')}
            <input
              type="text"
              inputMode="numeric"
              className={`${styles.input} ${styles.mono}${addForm.formState.errors.accountNumber ? ` ${styles.inputError}` : ''}`}
              {...addForm.register('accountNumber')}
            />
            {addForm.formState.errors.accountNumber && (
              <span className={styles.fieldError}>{addForm.formState.errors.accountNumber.message}</span>
            )}
          </label>

          <label className={styles.label}>
            {fmt('bankAccount.confirmAccountNumber')}
            <input
              type="text"
              inputMode="numeric"
              className={`${styles.input} ${styles.mono}${addForm.formState.errors.confirmAccountNumber ? ` ${styles.inputError}` : ''}`}
              {...addForm.register('confirmAccountNumber')}
            />
            {addForm.formState.errors.confirmAccountNumber && (
              <span className={styles.fieldError}>{addForm.formState.errors.confirmAccountNumber.message}</span>
            )}
          </label>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{fmt('bankAccount.accountType')}</legend>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" value="checking" {...addForm.register('accountType')} />
                {fmt('bankAccount.checking')}
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" value="saving" {...addForm.register('accountType')} />
                {fmt('bankAccount.saving')}
              </label>
            </div>
          </fieldset>

          <label className={styles.label}>
            {fmt('bankAccount.nickname')}
            <input
              type="text"
              placeholder={fmt('bankAccount.nicknameHint')}
              maxLength={60}
              className={styles.input}
              {...addForm.register('nickname')}
            />
          </label>

          {serverError && <p className={styles.serverError} role="alert">{serverError}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              {fmt('common.cancel')}
            </button>
            <button type="submit" className={styles.submitBtn} disabled={addForm.formState.isSubmitting}>
              {addForm.formState.isSubmitting ? <Spinner /> : fmt('common.save')}
            </button>
          </div>
        </form>
      )}

      {isEdit && (
        <form
          className={styles.form}
          onSubmit={(e) => void editForm.handleSubmit(onEditSubmit)(e)}
          noValidate
        >
          <div className={styles.readOnlyGroup}>
            <span className={styles.readOnlyLabel}>{fmt('bankAccount.bankName')}</span>
            <span className={styles.readOnlyValue}>{bank.bankName}</span>
          </div>
          <div className={styles.readOnlyGroup}>
            <span className={styles.readOnlyLabel}>{fmt('bankAccount.accountNumber')}</span>
            <span className={`${styles.readOnlyValue} ${styles.mono}`}>
              {intl.formatMessage({ id: 'bankAccount.accountEndingIn' }, { last4: bank.accountNumberLast4 })}
            </span>
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{fmt('bankAccount.accountType')}</legend>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" value="checking" {...editForm.register('accountType')} />
                {fmt('bankAccount.checking')}
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" value="saving" {...editForm.register('accountType')} />
                {fmt('bankAccount.saving')}
              </label>
            </div>
          </fieldset>

          <label className={styles.label}>
            {fmt('bankAccount.nickname')}
            <input
              type="text"
              placeholder={fmt('bankAccount.nicknameHint')}
              maxLength={60}
              className={styles.input}
              {...editForm.register('nickname')}
            />
          </label>

          {serverError && <p className={styles.serverError} role="alert">{serverError}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              {fmt('common.cancel')}
            </button>
            <button type="submit" className={styles.submitBtn} disabled={editForm.formState.isSubmitting}>
              {editForm.formState.isSubmitting ? <Spinner /> : fmt('common.save')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
