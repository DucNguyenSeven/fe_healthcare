"use client";

import * as React from "react";
import Image from "next/image";

export interface HealthcareNavbarLogoProps {
  className?: string;
}

export const HealthcareNavbarLogo = ({
  className = "",
}: HealthcareNavbarLogoProps) => {
  return (
    <div
      className={`w-20 h-20 flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <Image
        src="/assets/logo/Logo.png"
        alt="Healthcare+ Logo"
        width={80}
        height={80}
        className="object-contain"
        priority
      />
    </div>
  );
};

