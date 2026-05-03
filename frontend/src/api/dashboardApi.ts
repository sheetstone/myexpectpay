import { apiFetch } from './client'
import type { DashboardSummary, ActivityEntry } from '../types/api'

export const dashboardApi = {
  summary: () =>
    apiFetch<DashboardSummary>('/dashboard/summary'),

  activity: () =>
    apiFetch<ActivityEntry[]>('/dashboard/activity'),
}
