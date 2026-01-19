import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ওভারভিউ",
  description: "অ্যাডমিন ড্যাশবোর্ড — রিপোর্ট, ছাত্র ও সেটিংস।",
};

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}
