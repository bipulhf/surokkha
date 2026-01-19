import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "প্রোফাইল সম্পূর্ণ করুন",
  description: "সুরক্ষাতে অংশ নিতে আপনার প্রোফাইল সম্পূর্ণ করুন।",
};

export default function CompleteProfileLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}
