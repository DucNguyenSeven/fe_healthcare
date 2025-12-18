// Authentication enabled for production
import AuthGuard from "@/components/common/AuthGuard"
import RoleGuard from "@/components/common/RoleGuard"
import { PatientLayoutWrapper } from "@/features/patient/PatientLayoutWrapper"

export default function PatientLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <AuthGuard>
      <RoleGuard allow={["PATIENT"]}>
        <PatientLayoutWrapper>
          {children}
        </PatientLayoutWrapper>
      </RoleGuard>
    </AuthGuard>
  )
}
