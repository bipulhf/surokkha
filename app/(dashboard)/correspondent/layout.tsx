import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "রিপোর্টসমূহ",
  description: "করেসপন্ডেন্ট — রিপোর্ট তালিকা।",
};

export default function CorrespondentLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}
