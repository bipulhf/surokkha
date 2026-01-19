"use client";

import { useClerk } from "@clerk/nextjs";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { LogoutIcon } from "@hugeicons/core-free-icons";

export default function CompleteProfilePage() {
  const { signOut } = useClerk();

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ redirectUrl: "/" })}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <HugeiconsIcon
            icon={LogoutIcon}
            strokeWidth={2}
            className="size-4 mr-2"
          />
          লগআউট
        </Button>
      </div>
      <CompleteProfileForm />
    </div>
  );
}
