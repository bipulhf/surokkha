import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  asLink?: boolean;
};

const sizes = { sm: 32, md: 48, lg: 72, xl: 96, "2xl": 128 };

export function Logo({ size = "md", className, asLink = true }: LogoProps) {
  const px = sizes[size];
  const img = (
    <Image
      src="/images/logo.png"
      alt="সুরক্ষা"
      width={px}
      height={px}
      className={cn("shrink-0 object-contain", className)}
      priority
    />
  );
  if (asLink) {
    return (
      <Link
        href="/"
        className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
      >
        {img}
      </Link>
    );
  }
  return img;
}
