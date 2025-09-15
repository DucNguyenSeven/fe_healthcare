import AuthGuard from "@/components/common/AuthGuard"
import RoleGuard from "@/components/common/RoleGuard"

export default function DoctorLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <AuthGuard>
      <RoleGuard allow={["doctor"]}>
        {children}
      </RoleGuard>
    </AuthGuard>
  )
}
