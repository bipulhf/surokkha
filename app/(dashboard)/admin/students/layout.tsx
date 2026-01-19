import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ছাত্র",
  description: "ছাত্র তালিকা ও যাচাই।",
};

export default function StudentsLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}
