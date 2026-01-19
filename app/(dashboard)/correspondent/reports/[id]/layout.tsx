import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "রিপোর্ট বিস্তারিত",
  description: "রিপোর্টের বিস্তারিত ও মানচিত্র।",
};

export default function CorrespondentReportIdLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}
