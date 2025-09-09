"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
  redirectToHome?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallbackPath = ROUTES.LOGIN,
  redirectToHome = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push(fallbackPath);
      } else if (user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard if wrong role
        if (redirectToHome) {
          const homePath = user.role === 'DOCTOR'
            ? ROUTES.DOCTOR_DASHBOARD
            : ROUTES.PATIENT_DASHBOARD;
          router.push(homePath);
        } else {
          router.push(fallbackPath);
        }
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, fallbackPath, redirectToHome]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Đang kiểm tra quyền truy cập...
        </Typography>
      </Box>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render children if user doesn't have required role
  if (user && !allowedRoles.includes(user.role)) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "background.default",
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          color="error.main"
          sx={{ mb: 2, textAlign: "center" }}
        >
          Truy cập bị từ chối
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Bạn không có quyền truy cập trang này.
          <br />
          Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là lỗi.
        </Typography>
      </Box>
    );
  }

  // Render protected content
  return <>{children}</>;
};

export default RoleGuard;
