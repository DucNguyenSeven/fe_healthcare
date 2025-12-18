// Authentication enabled for production
import AuthGuard from "@/components/common/AuthGuard"
import RoleGuard from "@/components/common/RoleGuard"
import { DoctorLayoutWrapper } from "@/features/doctor/DoctorLayoutWrapper"

export default function DoctorLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <AuthGuard>
      <RoleGuard allow={["DOCTOR"]}>
        <DoctorLayoutWrapper>
          {children}
        </DoctorLayoutWrapper>
      </RoleGuard>
    </AuthGuard>
  )
}
