import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useIntl } from 'react-intl'
import { useQueryClient } from '@tanstack/react-query'
import { casesApi } from '../../api/casesApi'
import { validateCaseNumber } from '../../utils/validateCaseNumber'
import type { Case } from '../../types/api'
import { Modal, Spinner, useToast } from '../../components/ui'
import styles from './CaseForm.module.css'

interface CaseFormProps {
  editCase: Case | 'new' | null
  onClose: () => void
}

interface ChildItem {
  value: string
}

interface FormFields {
  caseNumber: string
  ncpName: string
  children: ChildItem[]
}

function buildSchema(fmt: (id: string) => string) {
  return yup.object({
    caseNumber: yup
      .string()
      .required(fmt('cases.caseNumber'))
      .test('case-number', fmt('cases.invalidCaseNumber'), (v) =>
        validateCaseNumber(v ?? '')
      ),
    ncpName: yup.string().required(fmt('cases.ncpName')),
    children: yup.array(yup.object({ value: yup.string().default('') })).default([]),
  })
}

function toFormChildren(children: string[]): ChildItem[] {
  return children.map((v) => ({ value: v }))
}

export function CaseForm({ editCase, onClose }: CaseFormProps) {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const isNew = editCase === 'new'
  const isEdit = editCase !== null && editCase !== 'new'

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormFields>({
    resolver: yupResolver(buildSchema(fmt)),
    defaultValues: { caseNumber: '', ncpName: '', children: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'children' })

  useEffect(() => {
    if (isEdit) {
      reset({
        caseNumber: editCase.caseNumber,
        ncpName: editCase.ncpName,
        children: toFormChildren(editCase.children),
      })
    } else if (isNew) {
      reset({ caseNumber: '', ncpName: '', children: [] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editCase])

  async function onSubmit(data: FormFields) {
    const payload = {
      caseNumber: data.caseNumber,
      ncpName: data.ncpName,
      children: data.children.map((f) => f.value).filter(Boolean),
    }
    try {
      if (isEdit) {
        await casesApi.update(editCase.id, payload)
      } else {
        await casesApi.create(payload)
      }
      await queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast(fmt('common.saveSuccess'), 'success')
      onClose()
    } catch {
      setError('root', { message: fmt('common.error') })
    }
  }

  const title = isNew ? fmt('cases.addTitle') : fmt('cases.edit')

  return (
    <Modal open={editCase !== null} title={title} onClose={onClose}>
      <form
        className={styles.form}
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        noValidate
      >
        <label className={styles.label}>
          {fmt('cases.caseNumber')}
          <input
            type="text"
            className={`${styles.input}${errors.caseNumber ? ` ${styles.inputError}` : ''}`}
            {...register('caseNumber')}
          />
          {errors.caseNumber && (
            <span className={styles.fieldError}>{errors.caseNumber.message}</span>
          )}
        </label>

        <label className={styles.label}>
          {fmt('cases.ncpName')}
          <input
            type="text"
            className={`${styles.input}${errors.ncpName ? ` ${styles.inputError}` : ''}`}
            {...register('ncpName')}
          />
          {errors.ncpName && (
            <span className={styles.fieldError}>{errors.ncpName.message}</span>
          )}
        </label>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{fmt('cases.children')}</legend>
          <div className={styles.childrenList}>
            {fields.map((field, index) => (
              <div key={field.id} className={styles.childRow}>
                <input
                  type="text"
                  className={styles.input}
                  {...register(`children.${index}.value`)}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => remove(index)}
                  aria-label={fmt('common.delete')}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.addChildBtn}
            onClick={() => append({ value: '' })}
          >
            {fmt('cases.addChild')}
          </button>
        </fieldset>

        {errors.root && (
          <p className={styles.serverError} role="alert">
            {errors.root.message}
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
