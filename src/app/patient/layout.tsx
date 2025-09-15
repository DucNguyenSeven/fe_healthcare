// DEVELOPMENT MODE: Authentication temporarily disabled for easier development
// import AuthGuard from "@/components/common/AuthGuard"
// import RoleGuard from "@/components/common/RoleGuard"
import { PatientLayoutWrapper } from "@/features/patient/PatientLayoutWrapper"

export default function PatientLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // TODO: Uncomment when ready for production
  // return (
  //   <AuthGuard>
  //     <RoleGuard allow={["patient"]}>
  //       <PatientLayoutWrapper>
  //         {children}
  //       </PatientLayoutWrapper>
  //     </RoleGuard>
  //   </AuthGuard>
  // )
  
  // Development mode: Direct access without authentication
  return (
    <PatientLayoutWrapper>
      {children}
    </PatientLayoutWrapper>
  )
}
