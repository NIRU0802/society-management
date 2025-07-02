'use client'

import DashboardLayout from '@/app/dashboard/layout'
import ParkingComponent from '@/app/dashboard/parking/ParkingComponent' // Your parking UI

export default function ParkingPage() {
  return (
    <DashboardLayout role="manager">
      <ParkingComponent />
    </DashboardLayout>
  )
}
