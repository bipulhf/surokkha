import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "প্রক্টর",
  description: "প্রক্টর তালিকা ও ব্যবস্থাপনা।",
};

export default function ProctorsLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}
