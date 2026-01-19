"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Logo } from "@/components/logo";

function GoLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/20 blur-[100px] rounded-full animate-pulse" />
      <Logo size="xl" asLink={false} className="relative z-10 animate-pulse" />
      <p className="text-muted-foreground animate-pulse">লোড হচ্ছে...</p>
    </div>
  );
}

function GoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();

  const destination = searchParams.get("to") || "/student";

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace(destination);
    } else {
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(destination)}`);
    }
  }, [isLoaded, isSignedIn, destination, router]);

  return <GoLoading />;
}

export default function GoPage() {
  return (
    <Suspense fallback={<GoLoading />}>
      <GoContent />
    </Suspense>
  );
}
