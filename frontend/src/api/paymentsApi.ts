import { apiFetch } from './client'
import type { Payment, SendPaymentInput, RequestPaymentInput, PaymentFilters, Paginated } from '../types/api'

export const paymentsApi = {
  list: (filters: PaymentFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.page)      params.set('page', String(filters.page))
    if (filters.limit)     params.set('limit', String(filters.limit))
    if (filters.startDate) params.set('startDate', filters.startDate)
    if (filters.endDate)   params.set('endDate', filters.endDate)
    filters.status?.forEach(s => params.append('status', s))
    return apiFetch<Paginated<Payment>>(`/payments?${params.toString()}`)
  },

  send: (data: SendPaymentInput) =>
    apiFetch<Payment>('/payments/send', { method: 'POST', body: JSON.stringify(data) }),

  request: (data: RequestPaymentInput) =>
    apiFetch<Payment>('/payments/request', { method: 'POST', body: JSON.stringify(data) }),
}
