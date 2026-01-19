import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "সাইন আপ",
  description: "সুরক্ষাতে নতুন অ্যাকাউন্ট তৈরি করুন।",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
