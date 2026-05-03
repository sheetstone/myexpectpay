import { NavLink } from 'react-router-dom'
import { useIntl } from 'react-intl'
import {
  HomeIcon,
  BuildingLibraryIcon,
  FolderIcon,
  UsersIcon,
  CreditCardIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import styles from './Nav.module.css'

const navItems = [
  { to: '/',            labelId: 'nav.home',         Icon: HomeIcon },
  { to: '/bank-accounts', labelId: 'nav.bankAccounts', Icon: BuildingLibraryIcon },
  { to: '/cases',       labelId: 'nav.cases',        Icon: FolderIcon },
  { to: '/recipients',  labelId: 'nav.recipients',   Icon: UsersIcon },
  { to: '/payments',    labelId: 'nav.payments',     Icon: CreditCardIcon },
  { to: '/messages',    labelId: 'nav.messages',     Icon: EnvelopeIcon },
]

export function Nav() {
  const intl = useIntl()

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.inner}>
        {navItems.map(({ to, labelId, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `${styles.link}${isActive ? ` ${styles.active}` : ''}`
            }
          >
            <Icon width={16} height={16} aria-hidden />
            {intl.formatMessage({ id: labelId })}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
