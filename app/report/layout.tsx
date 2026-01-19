import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "সুরক্ষা রিপোর্ট",
  description: "রিপোর্টের বিস্তারিত ও লোকেশন।",
};

export default function ReportLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}
