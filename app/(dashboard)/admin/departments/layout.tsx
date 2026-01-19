import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "বিভাগ",
  description: "বিভাগ তালিকা ও ব্যবস্থাপনা।",
};

export default function DepartmentsLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}
