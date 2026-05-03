import { apiFetch } from './client'
import type { MessagesResponse } from '../types/api'

export const messagesApi = {
  list: () =>
    apiFetch<MessagesResponse>('/messages'),

  markRead: (id: string) =>
    apiFetch<{ id: string; isRead: boolean }>(`/messages/${id}/read`, { method: 'PATCH' }),
}
