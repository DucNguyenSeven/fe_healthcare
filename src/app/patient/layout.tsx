import AuthGuard from "@/components/common/AuthGuard"
import RoleGuard from "@/components/common/RoleGuard"

export default function PatientLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <AuthGuard>
      <RoleGuard allow={["patient"]}>
        {children}
      </RoleGuard>
    </AuthGuard>
  )
}
