import { Link } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { useAuth } from '../../context/AuthContext'
import styles from './Header.module.css'

export function Header() {
  const { user, signOut } = useAuth()
  const intl = useIntl()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label={intl.formatMessage({ id: 'nav.logo' })}>
          <span className={styles.logoMark} aria-hidden>
            <span className={styles.logoBar} />
            <span className={styles.logoBar} />
            <span className={styles.logoBar} />
            <span className={styles.logoBar} />
          </span>
          MyExpertPay
        </Link>

        {user && (
          <div className={styles.actions}>
            <span className={styles.userInfo}>{user.email}</span>
            <button className={styles.signOut} onClick={() => void signOut()}>
              {intl.formatMessage({ id: 'auth.signOut' })}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
