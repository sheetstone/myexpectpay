import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/ui'
import { IconGoogle, IconEye, IconEyeOff, IconAlertCircle, IconLock, IconShield, IconCheck } from '../../components/ui/icons'
import { usePasswordToggle, useServerError, useFmt } from '../../hooks'
import { ApiError } from '../../api/client'
import { BrandPanel } from './BrandPanel'
import styles from './LoginPage.module.css'

interface LoginFields {
  email: string
  password: string
}

function buildSchema(fmt: (id: string) => string) {
  return yup.object({
    email: yup.string().required(fmt('auth.email')).email(fmt('auth.email')),
    password: yup.string().required(fmt('auth.password')),
  })
}

export function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail } = useAuth()
  const fmt = useFmt()
  const { error: serverError, setError: setServerError } = useServerError()
  const [googleBusy, setGoogleBusy] = useState(false)
  const pwd = usePasswordToggle()
  const [remember, setRemember] = useState(true)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFields>({
    resolver: yupResolver(buildSchema(fmt)),
  })

  if (loading) return <Spinner fullScreen />
  if (user) return <Navigate to="/" replace />

  async function handleGoogle() {
    setServerError('')
    setGoogleBusy(true)
    try {
      await signInWithGoogle()
    } catch {
      setServerError(fmt('common.error'))
      setGoogleBusy(false)
    }
  }

  async function onSubmit({ email, password }: LoginFields) {
    setServerError('')
    try {
      await signInWithEmail(email, password)
    } catch (err) {
      const code = err instanceof ApiError ? String(err.status) : (err as { code?: string }).code ?? ''
      if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setServerError(fmt('auth.wrongCredentials'))
      } else {
        setServerError(fmt('common.error'))
      }
    }
  }

  return (
    <div className={styles.page}>
      <BrandPanel />

      <div className={styles.formSide}>
        <div className={styles.formSideTop}>
          <span>Don't have an account?</span>
          <Link to="/register">Sign up</Link>
        </div>

        <div className={styles.formWrap}>
          <div className={styles.formInner}>
            <h1 className={styles.formTitle}>{fmt('auth.welcome')}</h1>
            <p className={styles.formSub}>Sign in to manage your bank accounts, cases, and payments.</p>

            <button
              type="button"
              className={styles.ssoBtn}
              onClick={() => void handleGoogle()}
              disabled={googleBusy}
            >
              {googleBusy ? <span className={styles.btnSpinner} /> : <IconGoogle />}
              {googleBusy ? 'Signing in…' : fmt('auth.signInWithGoogle')}
            </button>

            <div className={styles.divider}>{fmt('auth.orSeparator')}</div>

            <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
              {serverError && (
                <div className={styles.alert} role="alert">
                  <span className={styles.alertIcon}><IconAlertCircle /></span>
                  <div>
                    <div className={styles.alertTitle}>Incorrect email or password</div>
                    <div>{serverError}</div>
                  </div>
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="email">{fmt('auth.email')}</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`${styles.input}${errors.email ? ` ${styles.inputError}` : ''}`}
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="password">{fmt('auth.password')}</label>
                <input
                  id="password"
                  type={pwd.inputType}
                  placeholder="Enter your password"
                  className={`${styles.input} ${styles.inputWithIcon}${errors.password ? ` ${styles.inputError}` : ''}`}
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className={styles.pwdToggle}
                  onClick={pwd.toggle}
                  aria-label={pwd.visible ? 'Hide password' : 'Show password'}
                >
                  {pwd.visible ? <IconEyeOff /> : <IconEye />}
                </button>
                {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
              </div>

              <div className={styles.checkRow}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className={styles.customCheckbox} />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className={styles.forgotLink}>{fmt('auth.forgotPassword')}</Link>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? <><span className={styles.btnSpinner} /> Signing in…</> : fmt('auth.signIn')}
              </button>
            </form>

            <p className={styles.formFoot}>
              New to MyExpertPay? <Link to="/register">{fmt('auth.signUp')}</Link>
            </p>

            <div className={styles.trust}>
              <span className={styles.trustItem}><IconLock /> 256-bit SSL</span>
              <span className={styles.trustItem}><IconShield /> SOC 2 Type II</span>
              <span className={styles.trustItem}><IconCheck /> PCI DSS</span>
            </div>

            <p className={styles.legal}>
              By signing in, you agree to our{' '}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
