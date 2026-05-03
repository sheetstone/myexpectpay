import { apiFetch } from './client'
import type { Recipient, CreateRecipientInput, UpdateRecipientInput, Paginated } from '../types/api'

export const recipientsApi = {
  list: (page = 1, limit = 20) =>
    apiFetch<Paginated<Recipient>>(`/recipients?page=${page}&limit=${limit}`),

  create: (data: CreateRecipientInput) =>
    apiFetch<Recipient>('/recipients', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateRecipientInput) =>
    apiFetch<Recipient>(`/recipients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<void>(`/recipients/${id}`, { method: 'DELETE' }),
}
