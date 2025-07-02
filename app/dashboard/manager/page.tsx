'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ManagerDashboard() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/parking') // Redirect to parking page (sidebar default)
  }, [router])

  return null
}
