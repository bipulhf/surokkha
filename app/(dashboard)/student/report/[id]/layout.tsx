import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "রিপোর্ট বিস্তারিত",
  description: "রিপোর্টের বিস্তারিত দেখুন।",
};

export default function StudentReportIdLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}
