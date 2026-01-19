"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { SyncUser } from "@/components/auth/sync-user";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = url && url.startsWith("http") ? new ConvexReactClient(url) : null;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/student"
      signUpFallbackRedirectUrl="/complete-profile"
    >
      {convex ? (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <SyncUser>{children}</SyncUser>
        </ConvexProviderWithClerk>
      ) : (
        children
      )}
    </ClerkProvider>
  );
}
