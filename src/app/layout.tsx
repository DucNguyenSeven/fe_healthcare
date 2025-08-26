import React from "react";
import ThemeRegistry from "../theme/ThemeRegistry";
import { AuthProvider } from "../contexts/AuthContext";
import "./globals.css";
import "./output.css";

export const metadata = {
  title: "Healthcare+ - Hệ thống quản lý sức khỏe thận",
  description: "Nền tảng chăm sóc sức khỏe toàn diện, kết nối bệnh nhân với các bác sĩ chuyên môn cao. Quản lý sức khỏe thận, theo dõi chỉ số, tư vấn điều trị an toàn.",
  keywords: "sức khỏe, thận, bác sĩ, tư vấn, điều trị, healthcare, kidney health",
  authors: [{ name: "Healthcare+ Team" }],
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <ThemeRegistry>
          <AuthProvider>{children}</AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
