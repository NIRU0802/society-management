'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuperadminDashboard() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/superadmin/users')
  }, [router])

  return null // or a loader if you want
}
