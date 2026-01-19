"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { PermissionModal } from "./permission-modal";
import { hasAllPermissionsGranted } from "@/lib/permissions";

export function PermissionsGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [granted, setGranted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) setGranted(hasAllPermissionsGranted());
  }, [mounted]);

  const needPermissions = isLoaded && isSignedIn && !granted;

  return (
    <>
      {needPermissions && (
        <PermissionModal
          open={true}
          onComplete={() => setGranted(true)}
        />
      )}
      {(!needPermissions || granted) ? children : (
        <div className="flex min-h-[40vh] items-center justify-center p-4">
          <p className="text-muted-foreground">অনুমতি ডায়ালগ লোড হচ্ছে...</p>
        </div>
      )}
    </>
  );
}
