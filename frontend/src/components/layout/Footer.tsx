import { useIntl } from 'react-intl'
import { SUPPORTED_LOCALES } from '../../constants'
import { useLocale } from '../../context/LanguageProvider'
import styles from './Footer.module.css'

export function Footer() {
  const intl = useIntl()
  const { locale, setLocale } = useLocale()
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copyright}>
          {intl.formatMessage({ id: 'footer.copyright' }, { year })}
        </span>
        <div className={styles.locales}>
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l}
              className={`${styles.localeBtn}${locale === l ? ` ${styles.active}` : ''}`}
              onClick={() => setLocale(l)}
              aria-pressed={locale === l}
            >
              {intl.formatMessage({ id: `footer.locale.${l}` })}
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}
