import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "রিপোর্ট",
  description: "রিপোর্ট তালিকা ও স্ট্যাটাস ব্যবস্থাপনা।",
};

export default function AdminReportsLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}
