"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Button>;

interface PartnerWithUsProps extends Omit<ButtonProps, "onClick"> {
  asLink?: boolean;
  className?: string;
}

export function PartnerWithUs({ 
  asLink = false, 
  className = "", 
  variant = "default", 
  size = "default",
  children,
  ...props 
}: PartnerWithUsProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/organizer/onboarding");
  };

  if (asLink) {
    return (
      <Link href="/organizer/onboarding" passHref>
        <Button
          variant={variant}
          size={size}
          className={className}
          {...props}
        >
          {children || "Partner with us"}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children || "Partner with us"}
    </Button>
  );
} 