"use client";

import * as SignIn from "@clerk/elements/sign-in";
import * as Clerk from "@clerk/elements/common";
import { useSignIn } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

const HANDLED_VERIFICATION_STRATEGIES = ["password", "email_code"];
const HANDLED_VERIFICATION_STRATEGIES_CORRESPONDENT = ["password"];

export function SignInForm({ variant = "default" }: { variant?: "default" | "correspondent" }) {
  const isCorrespondent = variant === "correspondent";
  const { signIn } = useSignIn();
  const factors = signIn?.supportedFirstFactors ?? null;
  const handled = isCorrespondent ? HANDLED_VERIFICATION_STRATEGIES_CORRESPONDENT : HANDLED_VERIFICATION_STRATEGIES;
  const showOAuthFallback =
    Array.isArray(factors) &&
    !factors.some((f) => handled.includes(f.strategy));

  return (
    <SignIn.Root>
      <SignIn.Step name="start">
        <Card>
          <CardHeader>
            <CardTitle className="font-july text-xl">সাইন ইন</CardTitle>
            <CardDescription>
              {isCorrespondent ? "ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন" : "সুরক্ষাতে আপনার অ্যাকাউন্টে প্রবেশ করুন"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Clerk.GlobalError className="text-destructive text-sm" />
            {!isCorrespondent && (
              <>
                <Clerk.Connection
                  name="google"
                  className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full")}
                >
                  <Clerk.Icon className="mr-2 size-4" />
                  গুগল দিয়ে সাইন ইন
                </Clerk.Connection>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">অথবা</span>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-4">
              <Clerk.Field name="identifier">
                <Clerk.Label>ইমেইল</Clerk.Label>
                <Clerk.Input asChild>
                  <Input type="email" autoComplete="email" className="mt-1" />
                </Clerk.Input>
                <Clerk.FieldError className="text-destructive text-sm" />
              </Clerk.Field>
              <SignIn.Action submit asChild>
                <Button type="submit" className="w-full">পরবর্তী</Button>
              </SignIn.Action>
            </div>
            {!isCorrespondent && (
              <p className="text-center text-sm text-muted-foreground">
                অ্যাকাউন্ট নেই?{" "}
                <Link href="/sign-up" className="text-primary underline">
                  সাইন আপ
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </SignIn.Step>
      <SignIn.Step name="verifications" preferred={!isCorrespondent ? "password" : undefined}>
        <Card>
          <CardHeader>
            <CardTitle className="font-july text-xl">পাসওয়ার্ড দিন</CardTitle>
            <CardDescription>আপনার অ্যাকাউন্টে প্রবেশ করতে পাসওয়ার্ড দিন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Clerk.GlobalError className="text-destructive text-sm" />
            <SignIn.Strategy name="password">
              <div className="space-y-4">
                <Clerk.Field name="password">
                  <Clerk.Label>পাসওয়ার্ড</Clerk.Label>
                  <Clerk.Input asChild>
                    <Input type="password" autoComplete="current-password" className="mt-1" />
                  </Clerk.Input>
                  <Clerk.FieldError className="text-destructive text-sm" />
                </Clerk.Field>
                <SignIn.Action submit asChild>
                  <Button type="submit" className="w-full">সাইন ইন</Button>
                </SignIn.Action>
                <SignIn.Action navigate="forgot-password" asChild>
                  <Button type="button" variant="link" className="w-full text-muted-foreground p-0 h-auto">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Button>
                </SignIn.Action>
              </div>
            </SignIn.Strategy>
            {!isCorrespondent && (
              <SignIn.Strategy name="email_code">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    ইমেইলে পাঠানো কোড দিন। স্প্যাম বা জাঙ্ক ফোল্ডার দেখুন।
                  </p>
                  <Clerk.Field name="code">
                    <Clerk.Label>ভেরিফিকেশন কোড</Clerk.Label>
                    <Clerk.Input asChild>
                      <Input autoComplete="one-time-code" className="mt-1" />
                    </Clerk.Input>
                    <Clerk.FieldError className="text-destructive text-sm" />
                  </Clerk.Field>
                  <SignIn.Action submit asChild>
                    <Button type="submit" className="w-full">সাইন ইন</Button>
                  </SignIn.Action>
                  <SignIn.Action resend asChild>
                    <Button type="button" variant="link" className="w-full text-muted-foreground p-0 h-auto">
                      কোড পুনরায় পাঠান
                    </Button>
                  </SignIn.Action>
                </div>
              </SignIn.Strategy>
            )}
            {!isCorrespondent && (
              <SignIn.Strategy name="totp">
                <div className="space-y-4">
                  <Clerk.Field name="code">
                    <Clerk.Label>অথেন্টিকেটর অ্যাপ থেকে কোড</Clerk.Label>
                    <Clerk.Input asChild>
                      <Input autoComplete="one-time-code" className="mt-1" placeholder="০০০ ০০০" />
                    </Clerk.Input>
                    <Clerk.FieldError className="text-destructive text-sm" />
                  </Clerk.Field>
                  <SignIn.Action submit asChild>
                    <Button type="submit" className="w-full">সাইন ইন</Button>
                  </SignIn.Action>
                </div>
              </SignIn.Strategy>
            )}
            {!isCorrespondent && (
              <SignIn.Strategy name="backup_code">
                <div className="space-y-4">
                  <Clerk.Field name="code">
                    <Clerk.Label>ব্যাকআপ কোড</Clerk.Label>
                    <Clerk.Input asChild>
                      <Input autoComplete="one-time-code" className="mt-1" />
                    </Clerk.Input>
                    <Clerk.FieldError className="text-destructive text-sm" />
                  </Clerk.Field>
                  <SignIn.Action submit asChild>
                    <Button type="submit" className="w-full">সাইন ইন</Button>
                  </SignIn.Action>
                </div>
              </SignIn.Strategy>
            )}
            {showOAuthFallback && (
              <div className="text-center text-sm text-muted-foreground">
                {isCorrespondent ? (
                  <p>এই ইমেইলে পাসওয়ার্ড সেটআপ হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।</p>
                ) : (
                  <>
                    <p>এই ইমেইলে কোনো পাসওয়ার্ড নেই।</p>
                    <p>গুগল দিয়ে সাইন ইন করার চেষ্টা করুন।</p>
                  </>
                )}
              </div>
            )}
            <SignIn.Action navigate="start" asChild>
              <Button type="button" variant="ghost" className="w-full">
                পিছনে
              </Button>
            </SignIn.Action>
          </CardContent>
        </Card>
      </SignIn.Step>
      <SignIn.Step name="forgot-password">
        <Card>
          <CardHeader>
            <CardTitle className="font-july">পাসওয়ার্ড ভুলে গেছেন?</CardTitle>
            <CardDescription>রিসেট লিংক পেতে ইমেইল দিন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Clerk.Field name="identifier">
                <Clerk.Label>ইমেইল</Clerk.Label>
                <Clerk.Input asChild>
                  <Input className="mt-1" />
                </Clerk.Input>
                <Clerk.FieldError className="text-destructive text-sm" />
              </Clerk.Field>
              <SignIn.Action submit asChild>
                <Button type="submit" className="w-full">লিংক পাঠান</Button>
              </SignIn.Action>
            </div>
            <SignIn.Action navigate="start" asChild>
              <Button type="button" variant="ghost" className="w-full">
                পিছনে
              </Button>
            </SignIn.Action>
          </CardContent>
        </Card>
      </SignIn.Step>
      <SignIn.Step name="reset-password">
        <Card>
          <CardHeader>
            <CardTitle className="font-july">পাসওয়ার্ড রিসেট করুন</CardTitle>
            <CardDescription>নতুন পাসওয়ার্ড দিন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Clerk.GlobalError className="text-destructive text-sm" />
            <div className="space-y-4">
              <Clerk.Field name="password">
                <Clerk.Label>নতুন পাসওয়ার্ড</Clerk.Label>
                <Clerk.Input asChild>
                  <Input type="password" className="mt-1" />
                </Clerk.Input>
                <Clerk.FieldError className="text-destructive text-sm" />
              </Clerk.Field>
              <Clerk.Field name="confirmPassword">
                <Clerk.Label>পাসওয়ার্ড নিশ্চিত করুন</Clerk.Label>
                <Clerk.Input asChild>
                  <Input type="password" className="mt-1" />
                </Clerk.Input>
                <Clerk.FieldError className="text-destructive text-sm" />
              </Clerk.Field>
              <SignIn.Action submit asChild>
                <Button type="submit" className="w-full">পাসওয়ার্ড রিসেট করুন</Button>
              </SignIn.Action>
            </div>
            <SignIn.Action navigate="start" asChild>
              <Button type="button" variant="ghost" className="w-full">
                পিছনে
              </Button>
            </SignIn.Action>
          </CardContent>
        </Card>
      </SignIn.Step>
    </SignIn.Root>
  );
}
