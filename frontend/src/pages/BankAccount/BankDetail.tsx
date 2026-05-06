import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { banksApi } from '../../api/banksApi'
import type { BankAccount, BankAccountDetail } from '../../types/api'
import { BankLogo, TrendChart, Spinner } from '../../components/ui'
import { useFmt, useDisclosure, useClickOutside } from '../../hooks'
import styles from './BankDetail.module.css'

interface BankDetailProps {
  bankId: string
  accounts: BankAccount[]
  onEdit: (bank: BankAccount) => void
  onDelete: (id: string) => void
  onVerify: (id: string) => void
  onSetPrimary: (id: string) => void
  onToggleRouting: (id: string, key: 'receivePayments' | 'sendPayments', value: boolean) => void
}

export function BankDetail({ bankId, accounts, onEdit, onDelete, onVerify, onSetPrimary, onToggleRouting }: BankDetailProps) {
  const { data: detail, isLoading } = useQuery({
    queryKey: ['banks', bankId],
    queryFn: () => banksApi.getById(bankId),
  })

  const bank = accounts.find((b) => b.id === bankId)

  if (isLoading || !detail || !bank) {
    return (
      <div className={styles.panel}>
        <div className={styles.loading}><Spinner /></div>
      </div>
    )
  }

  return (
    <BankDetailInner
      bank={bank}
      detail={detail}
      onEdit={onEdit}
      onDelete={onDelete}
      onVerify={onVerify}
      onSetPrimary={onSetPrimary}
      onToggleRouting={onToggleRouting}
    />
  )
}

interface InnerProps {
  bank: BankAccount
  detail: BankAccountDetail
  onEdit: (bank: BankAccount) => void
  onDelete: (id: string) => void
  onVerify: (id: string) => void
  onSetPrimary: (id: string) => void
  onToggleRouting: (id: string, key: 'receivePayments' | 'sendPayments', value: boolean) => void
}

function BankDetailInner({ bank, detail, onEdit, onDelete, onVerify, onSetPrimary, onToggleRouting }: InnerProps) {
  const fmt = useFmt()
  const queryClient = useQueryClient()
  const menu = useDisclosure()
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside(menuRef, menu.close, menu.isOpen)

  const [editingNick, setEditingNick] = useState(false)
  const [nickDraft, setNickDraft] = useState('')
  const [savingNick, setSavingNick] = useState(false)

  const displayName = bank.nickname ?? bank.bankName
  const usedFor = (() => {
    if (bank.receivePayments && bank.sendPayments) return fmt('bankAccount.receiveAndSend')
    if (bank.receivePayments) return fmt('bankAccount.receiveOnly')
    if (bank.sendPayments) return fmt('bankAccount.sendOnly')
    return fmt('bankAccount.notRouted')
  })()

  const lastActivity = detail.stats.lastActivity
    ? new Date(detail.stats.lastActivity).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    : fmt('bankAccount.noActivity')

  async function saveNickname() {
    if (savingNick) return
    setSavingNick(true)
    try {
      await banksApi.update(bank.id, { nickname: nickDraft.trim() || null })
      await queryClient.invalidateQueries({ queryKey: ['banks'] })
    } finally {
      setSavingNick(false)
      setEditingNick(false)
    }
  }

  function startEditNick() {
    setNickDraft(bank.nickname ?? '')
    setEditingNick(true)
  }

  function handleNickKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') void saveNickname()
    if (e.key === 'Escape') setEditingNick(false)
  }

  return (
    <div className={styles.panel}>
      {/* ── Header ── */}
      <div className={styles.head}>
        <BankLogo bankName={bank.bankName} size="lg" />

        <div className={styles.who}>
          <div className={styles.nickRow}>
            {editingNick ? (
              <input
                className={styles.nickInput}
                value={nickDraft}
                onChange={(e) => setNickDraft(e.target.value)}
                onKeyDown={handleNickKey}
                onBlur={() => void saveNickname()}
                autoFocus
                disabled={savingNick}
                maxLength={60}
                aria-label={fmt('bankAccount.editNickname')}
              />
            ) : (
              <h2>{displayName}</h2>
            )}

            {!editingNick && (
              <button className={styles.editBtn} onClick={startEditNick} title={fmt('bankAccount.editNickname')}>
                <PencilIcon />
              </button>
            )}

            <span className={`${styles.pill} ${bank.verified ? styles.pillVerified : styles.pillPending}`}>
              {bank.verified ? fmt('bankAccount.verified') : fmt('bankAccount.pending')}
            </span>

            {bank.isPrimary && (
              <span className={`${styles.pill} ${styles.pillPrimary}`}>
                {fmt('bankAccount.primaryBadge')}
              </span>
            )}
          </div>
          <div className={styles.subLine}>
            {bank.accountType === 'checking' ? fmt('bankAccount.checking') : fmt('bankAccount.saving')}
            {' · '}··{bank.accountNumberLast4}
            {' · '}Routing {bank.routingNumber}
          </div>
        </div>

        <div className={styles.headActions}>
          {!bank.isPrimary && (
            <button className={styles.btnGhost} onClick={() => onSetPrimary(bank.id)}>
              <StarIcon />
              {fmt('bankAccount.setPrimary')}
            </button>
          )}

          <div className={styles.menuWrap} ref={menuRef}>
            <button className={styles.btnPrimary} onClick={menu.toggle}>
              <DotsIcon />
              Actions
            </button>
            {menu.isOpen && (
              <div className={styles.menu}>
                <button className={styles.mi} onClick={() => { menu.close(); onEdit(bank) }}>
                  <EditIcon />
                  {fmt('common.edit')}
                </button>
                {!bank.verified && (
                  <button className={styles.mi} onClick={() => { menu.close(); onVerify(bank.id) }}>
                    <CheckIcon />
                    {fmt('bankAccount.verify')}
                  </button>
                )}
                <button className={styles.mi} onClick={menu.close}>
                  <DownloadIcon />
                  {fmt('bankAccount.downloadStatement')}
                </button>
                <button className={`${styles.mi} ${styles.miDanger}`} onClick={() => { menu.close(); onDelete(bank.id) }}>
                  <TrashIcon />
                  {fmt('bankAccount.removeAccount')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Verify banner ── */}
      {!bank.verified && (
        <div className={styles.verifyBanner}>
          <div className={styles.verifyBannerIcon}><AlertIcon /></div>
          <div className={styles.verifyBannerText}>
            <div className={styles.verifyBannerTitle}>{fmt('bankAccount.verifyBannerTitle')}</div>
            <div className={styles.verifyBannerDesc}>{fmt('bankAccount.verifyBannerDesc')}</div>
          </div>
          <button className={styles.btnPrimary} onClick={() => onVerify(bank.id)}>
            {fmt('bankAccount.verify')}
          </button>
        </div>
      )}

      {/* ── Stats row ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCell}>
          <div className={styles.statLbl}>{fmt('bankAccount.totalReceived')}</div>
          <div className={styles.statVal}>
            <span className={styles.dollar}>$</span>
            {Math.floor(detail.stats.totalReceived).toLocaleString()}
            <span className={styles.cents}>.{String(Math.round((detail.stats.totalReceived % 1) * 100)).padStart(2, '0')}</span>
          </div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statLbl}>{fmt('bankAccount.totalSent')}</div>
          <div className={styles.statVal}>
            <span className={styles.dollar}>$</span>
            {Math.floor(detail.stats.totalSent).toLocaleString()}
            <span className={styles.cents}>.{String(Math.round((detail.stats.totalSent % 1) * 100)).padStart(2, '0')}</span>
          </div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statLbl}>{fmt('bankAccount.linkedCases')}</div>
          <div className={`${styles.statVal} ${styles.statValSm}`}>{detail.stats.linkedCases}</div>
          <div className={styles.statSub}>
            {fmt('bankAccount.activeCases', { count: detail.stats.linkedCases })}
          </div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statLbl}>{fmt('bankAccount.usedFor')}</div>
          <div className={`${styles.statVal} ${styles.statValSm}`}>{usedFor}</div>
          <div className={styles.statSub}>{fmt('bankAccount.lastActivity')} {lastActivity}</div>
        </div>
      </div>

      {/* ── Routing rules ── */}
      <div className={styles.routing}>
        <p className={styles.sectionTitle}>{fmt('bankAccount.routingRules')}</p>
        <div className={styles.toggleRow}>
          <button
            className={`${styles.toggle} ${bank.receivePayments ? styles.toggleOn : ''}`}
            onClick={() => onToggleRouting(bank.id, 'receivePayments', !bank.receivePayments)}
          >
            <div className={styles.toggleIcon}><ArrowDownIcon /></div>
            <div className={styles.toggleText}>
              <div className={styles.toggleTitle}>{fmt('bankAccount.receivePayments')}</div>
              <div className={styles.toggleDesc}>{fmt('bankAccount.receivePaymentsDesc')}</div>
            </div>
            <div className={`${styles.switch} ${bank.receivePayments ? styles.switchOn : ''}`} />
          </button>

          <button
            className={`${styles.toggle} ${bank.sendPayments ? styles.toggleOn : ''}`}
            onClick={() => onToggleRouting(bank.id, 'sendPayments', !bank.sendPayments)}
          >
            <div className={styles.toggleIcon}><ArrowUpIcon /></div>
            <div className={styles.toggleText}>
              <div className={styles.toggleTitle}>{fmt('bankAccount.sendPayments')}</div>
              <div className={styles.toggleDesc}>{fmt('bankAccount.sendPaymentsDesc')}</div>
            </div>
            <div className={`${styles.switch} ${bank.sendPayments ? styles.switchOn : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Trend chart ── */}
      <div className={styles.trendSection}>
        <div className={styles.trendHead}>
          <h3>{fmt('bankAccount.paymentTrend')}</h3>
          <span className={styles.trendLegend}>12 months</span>
        </div>
        <TrendChart data={[]} height={80} />
        <div className={styles.trendAxis}>
          {last12Months().map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>

      {/* ── Recent transactions ── */}
      <div className={styles.txSection}>
        <div className={styles.txHead}>
          <h3>{fmt('bankAccount.recentTransactions')}</h3>
        </div>
        {detail.recentPayments.length === 0 ? (
          <div className={styles.txEmpty}>{fmt('bankAccount.noTransactions')}</div>
        ) : (
          <>
            <table className={styles.txTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Case</th>
                  <th>Type</th>
                  <th className={styles.right}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {detail.recentPayments.map((tx, i) => {
                  const isReceive = tx.type === 'receive' || tx.type === 'RECEIVE'
                  return (
                    <tr key={i}>
                      <td className={styles.txDate}>
                        {new Date(tx.paymentDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className={styles.txCat}>{tx.caseNumber}</td>
                      <td>
                        <span className={`${styles.txType} ${isReceive ? styles.txTypeR : styles.txTypeS}`}>
                          {isReceive ? 'Receive' : 'Send'}
                        </span>
                      </td>
                      <td className={`${styles.txAmt} ${isReceive ? styles.txAmtR : styles.txAmtS}`}>
                        {isReceive ? '+' : '−'}${Number(tx.amount).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className={styles.txFoot}>
              <button className={styles.txLink}>{fmt('bankAccount.viewAllPayments')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function last12Months(): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d.toLocaleString('en-AU', { month: 'short' }).toUpperCase())
  }
  return months
}

// ── Inline icons ─────────────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  )
}
