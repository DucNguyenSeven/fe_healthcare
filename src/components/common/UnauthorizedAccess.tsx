"use client";

import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { LockOutlined, LoginOutlined } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

interface UnauthorizedAccessProps {
  message?: string;
  loginPath?: string;
}

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({
  message = "Bạn cần đăng nhập để truy cập tính năng này",
  loginPath = ROUTES.LOGIN,
}) => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push(loginPath);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "background.default",
        px: 2,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 4,
          textAlign: "center",
          maxWidth: 400,
          width: "100%",
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "primary.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <LockOutlined sx={{ fontSize: 40, color: "primary.main" }} />
        </Box>

        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          Truy cập bị hạn chế
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mb: 3, lineHeight: 1.6 }}
        >
          {message}
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<LoginOutlined />}
          onClick={handleLoginClick}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 3,
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          Đăng nhập ngay
        </Button>
      </Paper>
    </Box>
  );
};

export default UnauthorizedAccess;
