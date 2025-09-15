// DEVELOPMENT MODE: Authentication temporarily disabled for easier development
// import AuthGuard from "@/components/common/AuthGuard"
// import RoleGuard from "@/components/common/RoleGuard"
import { DoctorLayoutWrapper } from "@/features/doctor/DoctorLayoutWrapper"

export default function DoctorLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // TODO: Uncomment when ready for production
  // return (
  //   <AuthGuard>
  //     <RoleGuard allow={["doctor"]}>
  //       <DoctorLayoutWrapper>
  //         {children}
  //       </DoctorLayoutWrapper>
  //     </RoleGuard>
  //   </AuthGuard>
  // )
  
  // Development mode: Direct access without authentication
  return (
    <DoctorLayoutWrapper>
      {children}
    </DoctorLayoutWrapper>
  )
}
