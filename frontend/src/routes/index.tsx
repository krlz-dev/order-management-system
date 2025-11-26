import { createFileRoute } from '@tanstack/react-router'
import { apiService } from '@/services/api'
import { Dashboard } from '@/pages/Dashboard'

export const Route = createFileRoute('/')({
  component: Dashboard,
})