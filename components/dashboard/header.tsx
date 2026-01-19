"use client";

import Image from "next/image";
import { useClerk, useUser } from "@clerk/nextjs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { LogoutIcon, UserIcon } from "@hugeicons/core-free-icons";

export function Header() {
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogout = () => {
    signOut({ redirectUrl: "/" });
  };

  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.fullName ?? "Profile"}
                width={32}
                height={32}
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon
                  icon={UserIcon}
                  strokeWidth={2}
                  className="size-4"
                />
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuLabel>
            {user?.fullName ??
              user?.primaryEmailAddress?.emailAddress ??
              "Account"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
            <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
