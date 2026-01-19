"use client";

import * as SignUp from "@clerk/elements/sign-up";
import * as Clerk from "@clerk/elements/common";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function SignUpForm() {
  return (
    <SignUp.Root>
      <SignUp.Step name="start">
        <Card>
          <CardHeader>
            <CardTitle className="font-july text-xl">সাইন আপ</CardTitle>
            <CardDescription>সুরক্ষায় ছাত্র হিসেবে অ্যাকাউন্ট তৈরি করুন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Clerk.GlobalError className="text-destructive text-sm" />
            <Clerk.Connection
              name="google"
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full")}
            >
              <Clerk.Icon className="mr-2 size-4" />
              গুগল দিয়ে সাইন আপ
            </Clerk.Connection>
            <p className="text-center text-sm text-muted-foreground">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <Link href="/sign-in" className="text-primary underline">
                সাইন ইন
              </Link>
            </p>
          </CardContent>
        </Card>
      </SignUp.Step>
      <SignUp.Step name="continue">
        <Card>
          <CardHeader>
            <CardTitle className="font-july">প্রোফাইল</CardTitle>
            <CardDescription>কিছু তথ্য পূরণ করুন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4">
              <Clerk.Field name="firstName">
                <Clerk.Label>নামের প্রথম অংশ</Clerk.Label>
                <Clerk.Input className="mt-1" />
                <Clerk.FieldError className="text-destructive text-sm" />
              </Clerk.Field>
              <Clerk.Field name="lastName">
                <Clerk.Label>নামের শেষাংশ</Clerk.Label>
                <Clerk.Input className="mt-1" />
                <Clerk.FieldError className="text-destructive text-sm" />
              </Clerk.Field>
              <SignUp.Action submit asChild>
                <Button className="w-full">পরবর্তী</Button>
              </SignUp.Action>
            </form>
          </CardContent>
        </Card>
      </SignUp.Step>
      <SignUp.Step name="verifications">
        <Card>
          <CardHeader>
            <CardTitle className="font-july">যাচাইকরণ</CardTitle>
            <CardDescription>ইমেইলে পাঠানো কোড লিখুন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4">
              <Clerk.Field name="code">
                <Clerk.Label>কোড</Clerk.Label>
                <Clerk.Input className="mt-1" />
                <Clerk.FieldError className="text-destructive text-sm" />
              </Clerk.Field>
              <SignUp.Action submit asChild>
                <Button className="w-full">যাচাই করুন</Button>
              </SignUp.Action>
            </form>
          </CardContent>
        </Card>
      </SignUp.Step>
    </SignUp.Root>
  );
}
