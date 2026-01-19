import { SignInForm } from "@/components/auth/sign-in-form";

type PageProps = { params: Promise<{ "sign-in"?: string[] }> };

export default async function SignInPage({ params }: PageProps) {
  const p = await params;
  const variant = p["sign-in"]?.[0] === "correspondent" ? "correspondent" : "default";
  return <SignInForm variant={variant} />;
}
