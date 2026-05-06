import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/ui'
import { IconGoogle, IconEye, IconEyeOff, IconAlertCircle } from '../../components/ui/icons'
import { usePasswordToggle, useServerError, useFmt } from '../../hooks'
import { ApiError } from '../../api/client'
import styles from './RegisterPage.module.css'

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
  const pwd = usePasswordToggle()
  const confirmPwd = usePasswordToggle()

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
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>M</div>
          <span className={styles.logoName}>MyExpertPay</span>
        </div>
        <div className={styles.topbarRight}>
          <span>Already have an account?</span>
          <Link to="/login" className={styles.signinBtn}>Sign in</Link>
        </div>
      </header>

      <div className={styles.centerWrap}>
        <div className={styles.card}>
          <div className={styles.cardAccent} />
          <div className={styles.cardBody}>
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>Join MyExpertPay to manage child support payments securely.</p>

            {serverError && (
              <div className={styles.alert} role="alert">
                <IconAlertCircle />
                <div>
                  <div className={styles.alertTitle}>Registration failed</div>
                  <div>{serverError}</div>
                </div>
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="displayName">Full Name</label>
                  <input
                    id="displayName"
                    type="text"
                    placeholder="Jane Smith"
                    className={`${styles.input}${errors.displayName ? ` ${styles.inputError}` : ''}`}
                    autoComplete="name"
                    autoFocus
                    {...register('displayName')}
                  />
                  {errors.displayName && <span className={styles.fieldError}>{errors.displayName.message}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="email">Email Address</label>
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
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="password">Password</label>
                  <div className={styles.inputWrap}>
                    <input
                      id="password"
                      type={pwd.inputType}
                      placeholder="Min. 8 characters"
                      className={`${styles.input} ${styles.inputWithIcon}${errors.password ? ` ${styles.inputError}` : ''}`}
                      autoComplete="new-password"
                      {...register('password')}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={pwd.toggle}>
                      {pwd.visible ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="confirmPassword">Confirm Password</label>
                  <div className={styles.inputWrap}>
                    <input
                      id="confirmPassword"
                      type={confirmPwd.inputType}
                      placeholder="Re-enter password"
                      className={`${styles.input} ${styles.inputWithIcon}${errors.confirmPassword ? ` ${styles.inputError}` : ''}`}
                      autoComplete="new-password"
                      {...register('confirmPassword')}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={confirmPwd.toggle}>
                      {confirmPwd.visible ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword.message}</span>}
                </div>
              </div>

              <p className={styles.pwdHint}>
                Must be at least 8 characters with a mix of letters and numbers.
              </p>

              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? <><span className={styles.btnSpinner} /> Creating account…</> : 'Create Account'}
              </button>
            </form>

            <div className={styles.divider}>OR</div>

            <button type="button" className={styles.googleBtn}>
              <IconGoogle />
              Sign up with Google
            </button>

            <p className={styles.switchPrompt}>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>

            <p className={styles.legal}>
              Your data is encrypted and never shared. By registering you accept our{' '}
              <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔒</div>
            <div>
              <div className={styles.featureName}>Bank-grade security</div>
              <div className={styles.featureSub}>256-bit SSL encryption</div>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>⚡</div>
            <div>
              <div className={styles.featureName}>On-time transfers</div>
              <div className={styles.featureSub}>Payments processed same day</div>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🎧</div>
            <div>
              <div className={styles.featureName}>Dedicated support</div>
              <div className={styles.featureSub}>Help available 7 days a week</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
