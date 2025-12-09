import { AdminLayoutWrapper } from '@/features/admin/AdminLayoutWrapper'
import RoleGuard from '@/components/common/RoleGuard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard | HealthCare+',
  description: 'Quản lý hệ thống HealthCare+ toàn diện',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allow={['ADMIN']}>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </RoleGuard>
  )
}
