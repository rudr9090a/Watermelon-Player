import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import shellStyles from "@/components/auth/AuthShell.module.css";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create an account on your self-hosted Watermelon music server.",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up a profile on your Watermelon server. It only takes a moment."
      footer={
        <>
          Already have an account?{" "}
          <Link className={shellStyles.textLink} href="/login">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
