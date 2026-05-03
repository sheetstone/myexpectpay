import { apiFetch } from './client'
import type { BankAccount, CreateBankAccountInput, UpdateBankAccountInput, Paginated } from '../types/api'

export const banksApi = {
  list: (page = 1, limit = 20) =>
    apiFetch<Paginated<BankAccount>>(`/banks?page=${page}&limit=${limit}`),

  create: (data: CreateBankAccountInput) =>
    apiFetch<BankAccount>('/banks', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateBankAccountInput) =>
    apiFetch<BankAccount>(`/banks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<void>(`/banks/${id}`, { method: 'DELETE' }),

  verify: (id: string) =>
    apiFetch<{ id: string; verified: boolean }>(`/banks/${id}/verify`, { method: 'PATCH' }),

  lookup: (routing: string) =>
    apiFetch<{ bankName: string }>(`/banks/lookup/${routing}`),
}
