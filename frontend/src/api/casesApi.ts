import { apiFetch } from './client'
import type { Case, CreateCaseInput, UpdateCaseInput, Paginated } from '../types/api'

export const casesApi = {
  list: (page = 1, limit = 20) =>
    apiFetch<Paginated<Case>>(`/cases?page=${page}&limit=${limit}`),

  create: (data: CreateCaseInput) =>
    apiFetch<Case>('/cases', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateCaseInput) =>
    apiFetch<Case>(`/cases/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<void>(`/cases/${id}`, { method: 'DELETE' }),
}
