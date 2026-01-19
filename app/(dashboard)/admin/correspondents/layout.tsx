import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "করেসপন্ডেন্ট",
  description: "করেসপন্ডেন্ট তালিকা ও ইনভাইট।",
};

export default function CorrespondentsLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}
