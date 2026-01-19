"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

const SYNC_WAIT_MS = 3000;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [syncWaitDone, setSyncWaitDone] = useState(false);
  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (convexUser !== null || !user?.id) return;
    const t = setTimeout(() => setSyncWaitDone(true), SYNC_WAIT_MS);
    return () => clearTimeout(t);
  }, [convexUser, user?.id]);

  // Redirect to complete-profile if user not synced after timeout
  useEffect(() => {
    if (!convexUser && syncWaitDone) {
      router.replace("/complete-profile");
    }
  }, [convexUser, syncWaitDone, router]);

  // Redirect to correct role-based route
  const role = convexUser?.role;
  const pathRole = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/correspondent")
      ? "correspondent"
      : pathname.startsWith("/student")
        ? "student"
        : null;

  useEffect(() => {
    if (role && pathRole && pathRole !== role) {
      const base =
        role === "admin" ? "/admin" : role === "correspondent" ? "/correspondent" : "/student";
      router.replace(base);
    }
  }, [role, pathRole, router]);

  if (!isLoaded || convexUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!convexUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (pathRole && pathRole !== convexUser.role) {
    // Will redirect via useEffect, show loading
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <SidebarProvider className="flex min-h-screen">
      <Sidebar role={convexUser.role} />
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
