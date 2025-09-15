"use client";

import * as React from "react";
export interface HealthcareLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}
export const HealthcareLogo = ({
  size = "md",
  className = ""
}: HealthcareLogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    // 32px - mobile/small
    md: "w-10 h-10 text-sm",
    // 40px - default navbar
    lg: "w-12 h-12 text-base",
    // 48px - auth forms
    xl: "w-16 h-16 text-lg" // 64px - large displays
  };
  return <div className={`${sizeClasses[size]} bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 ${className}`}>
      <span className="text-white font-bold leading-none">H+</span>
    </div>;
};