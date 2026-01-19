"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";

export function SyncUser({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const createUser = useMutation(api.users.createOrUpdateFromClerk);
  const creating = useRef(false);

  useEffect(() => {
    if (isLoaded && user && convexUser === null && !creating.current) {
      creating.current = true;
      createUser({ clerkId: user.id, role: "student" });
    }
  }, [isLoaded, user, convexUser, createUser]);

  return <>{children}</>;
}
