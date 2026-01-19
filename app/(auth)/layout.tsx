"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isCompleteProfile = pathname === "/complete-profile";

  useEffect(() => {
    if (isLoaded && isSignedIn && !isCompleteProfile) {
      router.replace("/student");
    }
  }, [isLoaded, isSignedIn, isCompleteProfile, router]);

  if (!isLoaded || (isSignedIn && !isCompleteProfile)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background relative overflow-hidden">
        {/* Loading Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/20 blur-[100px] rounded-full animate-pulse" />
        <Logo
          size="lg"
          asLink={false}
          className="relative z-10 animate-pulse"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden selection:bg-brand-500/30">
      {/* Background Gradients/Blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-orange/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-background/50 hover:text-brand-500 transition-colors"
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            হোম-এ ফিরে যান
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <Logo size="2xl" asLink={false} className="mx-auto drop-shadow-lg" />
        </div>

        <div className="w-full backdrop-blur-sm">{children}</div>
      </div>
    </div>
  );
}
