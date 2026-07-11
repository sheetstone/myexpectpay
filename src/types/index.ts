// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

// ── Bank Accounts ─────────────────────────────────────────────────────────────

export type AccountType = "checking" | "saving"

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
  createdAt: string
  updatedAt: string
}

export interface CreateBankAccountInput {
  bankName: string
  routingNumber: string
  accountNumber: string
  confirmAccountNumber: string
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

export const PAYMENT_STATUS = {
  accepted: "accepted",
  cancelled: "cancelled",
  completed: "completed",
  expired: "expired",
  in_progress: "in_progress",
  rejected: "rejected",
  returned: "returned",
  reversal_in_progress: "reversal_in_progress",
  reversal_completed: "reversal_completed",
  reversal_rejected: "reversal_rejected",
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export const PAYMENT_TYPE = {
  sent: "sent",
  received: "received",
  pending_sent: "pending_sent",
  pending_received: "pending_received",
} as const

export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE]

export interface Payment {
  id: string
  amount: number
  caseNumber: string
  recipientId: string | null
  recipientName: string
  bankId: string | null
  paymentDate: string
  status: PaymentStatus
  type: PaymentType
  note: string | null
  createdAt: string
}

export interface SendPaymentInput {
  bankId: string
  recipientId?: string
  recipientName: string
  caseNumber: string
  amount: number
  paymentDate: string
  note?: string
}

export interface RequestPaymentInput {
  recipientId?: string
  recipientName: string
  caseNumber: string
  amount: number
  paymentDate: string
  note?: string
}

export interface PaymentFilters {
  startDate?: string
  endDate?: string
  status?: PaymentStatus[]
  cursor?: string
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
  nextCursor: string | null
  hasMore: boolean
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface ChartDataItem {
  month: string
  sent: number
  received: number
}

export type CalendarEvent = Pick<
  Payment,
  "id" | "amount" | "caseNumber" | "recipientName" | "paymentDate" | "status" | "type"
>

export interface DashboardResponse {
  balance: number
  totalSentThisMonth: number
  totalReceivedThisMonth: number
  pendingCount: number
  unreadMessageCount: number
  recentMessages: Pick<Message, "id" | "sender" | "subject" | "isRead" | "createdAt">[]
  chart: ChartDataItem[]
  calendarEvents: CalendarEvent[]
}
