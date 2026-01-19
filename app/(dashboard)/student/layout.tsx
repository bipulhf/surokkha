import type { Metadata } from "next";
import { StudentLayoutClient } from "./StudentLayoutClient";

export const metadata: Metadata = {
  title: "ড্যাশবোর্ড",
  description: "ছাত্র ড্যাশবোর্ড।",
};

export default function StudentLayout({
  children,
}: { children: React.ReactNode }) {
  return <StudentLayoutClient>{children}</StudentLayoutClient>;
}
