// ── Shared ────────────────────────────────────────────────────────────────────

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  displayName: string
}

// ── Bank Accounts ─────────────────────────────────────────────────────────────

export type AccountType = 'checking' | 'saving'

export interface BankAccount {
  id: string
  bankName: string
  nickname: string | null
  routingNumber: string
  accountNumberLast4: string
  accountType: AccountType
  verified: boolean
  isPrimary: boolean
  receivePayments: boolean
  sendPayments: boolean
  linkedPayments: number
  createdAt: string
}

export interface BankAccountDetail extends BankAccount {
  stats: {
    totalReceived: number
    totalSent: number
    linkedCases: number
    lastActivity: string | null
  }
  recentPayments: Array<{
    type: string
    amount: string
    paymentDate: string
    caseNumber: string
  }>
}

export interface CreateBankAccountInput {
  bankName: string
  routingNumber: string
  accountNumber: string
  accountType: AccountType
  nickname?: string
}

export interface UpdateBankAccountInput {
  accountType?: AccountType
  nickname?: string | null
  isPrimary?: boolean
  receivePayments?: boolean
  sendPayments?: boolean
}

// ── Cases ─────────────────────────────────────────────────────────────────────

export interface Case {
  id: string
  caseNumber: string
  ncpName: string
  children: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateCaseInput {
  caseNumber: string
  ncpName: string
  children: string[]
}

export type UpdateCaseInput = Partial<CreateCaseInput>

// ── Recipients ────────────────────────────────────────────────────────────────

export interface Recipient {
  id: string
  firstName: string
  lastName: string
  email: string
  caseId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRecipientInput {
  firstName: string
  lastName: string
  email: string
  caseId?: string
}

export type UpdateRecipientInput = Partial<CreateRecipientInput>

// ── Payments ──────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | 'accepted' | 'cancelled' | 'completed' | 'expired' | 'in_progress'
  | 'rejected' | 'returned' | 'reversal_in_progress' | 'reversal_completed' | 'reversal_rejected'

export type PaymentType = 'sent' | 'received' | 'pending_sent' | 'pending_received'

export interface Payment {
  id: string
  amount: string
  caseNumber: string
  recipientName: string
  paymentDate: string
  status: PaymentStatus
  type: PaymentType
  createdAt: string
  bank: { id: string; bankName: string; accountNumberLast4: string } | null
  recipient: { id: string; firstName: string; lastName: string } | null
}

export interface SendPaymentInput {
  bankId: string
  recipientId?: string
  recipientName: string
  caseNumber: string
  amount: number
  paymentDate: string
}

export interface RequestPaymentInput {
  recipientId?: string
  recipientName: string
  caseNumber: string
  amount: number
  paymentDate: string
}

export interface PaymentFilters {
  startDate?: string
  endDate?: string
  status?: PaymentStatus[]
  page?: number
  limit?: number
}

// ── Messages ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  sender: string
  subject: string
  body: string
  isRead: boolean
  createdAt: string
}

export interface MessagesResponse {
  items: Message[]
  unreadCount: number
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  balance: number
  totalSent: number
  totalReceived: number
  pendingCount: number
  unreadMessageCount: number
}

export interface ActivityEntry {
  date: string
  count: number
}
