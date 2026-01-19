import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "সাইন ইন",
  description: "সুরক্ষাতে অ্যাকাউন্টে সাইন ইন করুন।",
};

type PageProps = { params: Promise<{ "sign-in"?: string[] }> };

export default async function SignInPage({ params }: PageProps) {
  const p = await params;
  const variant = p["sign-in"]?.[0] === "correspondent" ? "correspondent" : "default";
  return <SignInForm variant={variant} />;
}
