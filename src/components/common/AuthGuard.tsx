"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallbackPath = ROUTES.LOGIN,
}) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store current path to redirect back after login
      const currentPath = window.location.pathname;
      if (currentPath !== fallbackPath) {
        sessionStorage.setItem("redirectAfterLogin", currentPath);
      }
      router.push(fallbackPath);
    }
  }, [isAuthenticated, isLoading, router, fallbackPath]);

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
          Đang kiểm tra thông tin đăng nhập...
        </Typography>
      </Box>
    );
  }

  // Don't render children if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
};

export default AuthGuard;
