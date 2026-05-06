import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/ui'
import { ApiError } from '../../api/client'
import { useFmt, useServerError } from '../../hooks'
import styles from './LoginPage.module.css'
import ownStyles from './RegisterPage.module.css'

interface RegisterFields {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

function buildSchema(fmt: (id: string) => string) {
  return yup.object({
    displayName: yup.string().trim().required(fmt('auth.displayName')),
    email: yup.string().required(fmt('auth.email')).email(fmt('auth.email')),
    password: yup.string().required(fmt('auth.password')).min(8, fmt('auth.passwordMinLength')),
    confirmPassword: yup
      .string()
      .required(fmt('auth.confirmPassword'))
      .oneOf([yup.ref('password')], fmt('auth.passwordMismatch')),
  })
}

export function RegisterPage() {
  const { user, loading, registerWithEmail } = useAuth()
  const fmt = useFmt()
  const { error: serverError, setError: setServerError } = useServerError()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFields>({
    resolver: yupResolver(buildSchema(fmt)),
  })

  if (loading) return <Spinner fullScreen />
  if (user) return <Navigate to="/" replace />

  async function onSubmit({ displayName, email, password }: RegisterFields) {
    setServerError('')
    try {
      await registerWithEmail(displayName.trim(), email, password)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setServerError(fmt('auth.emailAlreadyInUse'))
      } else {
        setServerError(fmt('common.error'))
      }
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.hero} aria-hidden="true">
        <div className={styles.cards}>
          <div className={`${styles.card} ${styles.card1}`}>{fmt('auth.feature1')}</div>
          <div className={`${styles.card} ${styles.card2}`}>{fmt('auth.feature2')}</div>
          <div className={`${styles.card} ${styles.card3}`}>{fmt('auth.feature3')}</div>
        </div>
      </div>

      <div className={styles.loginSide}>
        <div className={styles.loginBox}>
          <div className={styles.loginBoxHeader}>{fmt('auth.register')}</div>
          <div className={`${styles.loginBoxBody} ${ownStyles.body}`}>
            {serverError && <p className={styles.error} role="alert">{serverError}</p>}

            <form className={styles.form} onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
              <label className={styles.label}>
                {fmt('auth.displayName')}
                <input
                  type="text"
                  className={`${styles.input}${errors.displayName ? ` ${styles.inputError}` : ''}`}
                  autoComplete="name"
                  autoFocus
                  {...register('displayName')}
                />
                {errors.displayName && <span className={styles.fieldError}>{errors.displayName.message}</span>}
              </label>

              <label className={styles.label}>
                {fmt('auth.email')}
                <input
                  type="email"
                  className={`${styles.input}${errors.email ? ` ${styles.inputError}` : ''}`}
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
              </label>

              <label className={styles.label}>
                {fmt('auth.password')}
                <input
                  type="password"
                  className={`${styles.input}${errors.password ? ` ${styles.inputError}` : ''}`}
                  autoComplete="new-password"
                  {...register('password')}
                />
                {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
              </label>

              <label className={styles.label}>
                {fmt('auth.confirmPassword')}
                <input
                  type="password"
                  className={`${styles.input}${errors.confirmPassword ? ` ${styles.inputError}` : ''}`}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword.message}</span>}
              </label>

              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : fmt('auth.register')}
              </button>
            </form>

            <p className={styles.switchPrompt}>
              {fmt('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className={styles.switchLink}>{fmt('auth.signIn')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
