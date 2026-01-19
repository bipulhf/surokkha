"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function StudentLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const router = useRouter();
  const convexUser = useQuery(api.users.getByClerkId, user?.id ? { clerkId: user.id } : "skip");
  const student = useQuery(
    api.students.getByUserId,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  if (convexUser === undefined || student === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!convexUser || !student) {
    router.replace("/complete-profile");
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">রিডাইরেক্ট হচ্ছে...</p>
      </div>
    );
  }

  if (!student.isProfileComplete || !student.isVerified) {
    router.replace("/complete-profile");
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">রিডাইরেক্ট হচ্ছে...</p>
      </div>
    );
  }

  return <>{children}</>;
}
