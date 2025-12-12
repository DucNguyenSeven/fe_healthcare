"use client";

import * as React from "react";
import Image from "next/image";

export interface HealthcareSidebarLogoProps {
  className?: string;
}

export const HealthcareSidebarLogo = ({
  className = "",
}: HealthcareSidebarLogoProps) => {
  return (
    <div
      className={`w-14 h-14 flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <Image
        src="/assets/logo/Logo.png"
        alt="Healthcare+ Logo"
        width={56}
        height={56}
        className="object-contain"
        priority
      />
    </div>
  );
};

