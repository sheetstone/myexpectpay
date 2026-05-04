import { useState } from 'react'
import { useIntl } from 'react-intl'
import {
  ChartBarIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { AccountSummary } from './AccountSummary'
import { PaymentChart } from './PaymentChart'
import { ActivityCalendar } from './ActivityCalendar'
import { RecentMessages } from './RecentMessages'
import styles from './HomePage.module.css'

type Tab = 'summary' | 'calendar' | 'messages'

export function HomePage() {
  const { user } = useAuth()
  const intl = useIntl()
  const fmt = (id: string, values?: Record<string, string>) => intl.formatMessage({ id }, values)
  const [activeTab, setActiveTab] = useState<Tab>('summary')

  return (
    <main className={styles.root}>
      {/* Welcome */}
      <div className={styles.welcomeRow}>
        <h2 className={styles.welcomeTitle}>
          {fmt('dashboard.hello', { name: user?.displayName ?? '' })}
        </h2>
      </div>

      {/* Tab bar */}
      <div className={styles.tabBar}>
        <TabBtn id="summary" active={activeTab} onClick={setActiveTab}>
          <ChartBarIcon width={16} height={16} />
          {fmt('dashboard.accountSummary')}
        </TabBtn>
        <TabBtn id="calendar" active={activeTab} onClick={setActiveTab}>
          <CalendarDaysIcon width={16} height={16} />
          {fmt('dashboard.activityCalendar')}
        </TabBtn>
        <TabBtn id="messages" active={activeTab} onClick={setActiveTab}>
          <ChatBubbleLeftRightIcon width={16} height={16} />
          {fmt('dashboard.recentMessages')}
        </TabBtn>
      </div>

      {/* Tab content */}
      <div className={styles.tabContent}>
        {activeTab === 'summary' && (
          <>
            <AccountSummary />
            <div className={styles.divider} />
            <PaymentChart />
          </>
        )}
        {activeTab === 'calendar' && <ActivityCalendar />}
        {activeTab === 'messages' && <RecentMessages />}
      </div>
    </main>
  )
}

function TabBtn({ id, active, onClick, children }: {
  id: Tab
  active: Tab
  onClick: (t: Tab) => void
  children: React.ReactNode
}) {
  const isActive = id === active
  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={`${styles.tab}${isActive ? ` ${styles.tabActive}` : ''}`}
      onClick={() => onClick(id)}
    >
      {children}
    </button>
  )
}
