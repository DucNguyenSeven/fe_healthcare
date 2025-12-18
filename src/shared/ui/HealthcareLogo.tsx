"use client";

import * as React from "react";
import Image from "next/image";

export interface HealthcareLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const HealthcareLogo = ({
  size = "md",
  className = "",
}: HealthcareLogoProps) => {
  const sizeClasses = {
    sm: "w-20 h-20",
    // 80px - mobile/small
    md: "w-28 h-28",
    // 112px - default navbar & auth forms
    lg: "w-36 h-36",
    // 144px - larger displays
    xl: "w-48 h-48", // 192px - large displays
  };

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <Image
        src="/assets/logo/Logo.png"
        alt="Healthcare+ Logo"
        width={
          size === "sm" ? 80 : size === "md" ? 112 : size === "lg" ? 144 : 192
        }
        height={
          size === "sm" ? 80 : size === "md" ? 112 : size === "lg" ? 144 : 192
        }
        className="object-contain"
        priority
      />
    </div>
  );
};
