"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useIntl } from "react-intl"
import {
  Squares2X2Icon,
  BuildingLibraryIcon,
  FolderIcon,
  UsersIcon,
  CurrencyDollarIcon,
  InboxIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"
import { useAuth } from "@/components/providers/AuthProvider"
import styles from "./AppShell.module.css"
import type { SessionUser } from "@/lib/session"

interface NavItem {
  href: string
  labelKey: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "nav.home", icon: Squares2X2Icon, exact: true },
  { href: "/bank-accounts", labelKey: "nav.bankAccounts", icon: BuildingLibraryIcon },
  { href: "/cases", labelKey: "nav.cases", icon: FolderIcon },
  { href: "/recipients", labelKey: "nav.recipients", icon: UsersIcon },
  { href: "/payments", labelKey: "nav.payments", icon: CurrencyDollarIcon },
  { href: "/messages", labelKey: "nav.messages", icon: InboxIcon },
  { href: "/profile", labelKey: "nav.profile", icon: UserCircleIcon },
  { href: "/settings", labelKey: "nav.settings", icon: Cog6ToothIcon },
]

interface AppShellProps {
  user: SessionUser
  children: React.ReactNode
}

export function AppShell({ user, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()
  const intl = useIntl()

  const displayName = user.name || user.email || "Account"

  return (
    <div className={styles.shell}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.logoRow}>
          <span className={styles.logo}>MyExpertPay</span>
          <button
            className={styles.closeBtn}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <XMarkIcon width={20} height={20} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, labelKey, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={styles.navIcon} />
                <span>{intl.formatMessage({ id: labelKey })}</span>
              </Link>
            )
          })}
        </nav>

        <div className={styles.userFooter}>
          <div className={styles.userInfo}>
            <span className={styles.userName} title={displayName}>
              {displayName}
            </span>
            {user.name && user.email && (
              <span className={styles.userEmail} title={user.email}>
                {user.email}
              </span>
            )}
          </div>
          <button
            className={styles.signOutBtn}
            onClick={signOut}
            aria-label={intl.formatMessage({ id: "auth.signOut" })}
          >
            <ArrowRightOnRectangleIcon width={16} height={16} />
            <span>{intl.formatMessage({ id: "auth.signOut" })}</span>
          </button>
        </div>
      </aside>

      {/* Page content */}
      <div className={styles.body}>
        {/* Mobile top bar */}
        <header className={styles.mobileHeader}>
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon width={22} height={22} />
          </button>
          <span className={styles.mobileLogo}>MyExpertPay</span>
        </header>

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
