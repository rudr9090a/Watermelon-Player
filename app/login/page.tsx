import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import shellStyles from "@/components/auth/AuthShell.module.css";
import { watermelonDashboard } from "@/lib/server/watermelon";
import { SESSION_COOKIE, USERNAME_COOKIE } from "@/lib/auth-cookies";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your self-hosted Watermelon music library.",
};

// Session validation is request-specific and must happen before rendering.
export const instant = false;

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  const username = cookieStore.get(USERNAME_COOKIE)?.value;

  if (session && username) {
    const result = await watermelonDashboard({ session, username });
    if (result.ok) {
      redirect("/dashboard");
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to listen to your library."
      footer={
        <>
          New to Watermelon?{" "}
          <Link className={shellStyles.textLink} href="/signup">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
