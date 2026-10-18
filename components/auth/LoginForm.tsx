"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "@/components/icons";
import { ApiError, login } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import styles from "./AuthForm.module.css";

type FieldErrors = {
  username?: string;
  password?: string;
};

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!username.trim()) {
      next.username = "Enter your username.";
    }
    if (!password) {
      next.password = "Enter your password.";
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setFormError(null);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await login({ username: username.trim(), password });
      // The session cookie is set by the API bridge; open the dashboard.
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {formError ? (
        <div className={styles.formError} role="alert">
          <AlertCircle size={16} />
          <span>{formError}</span>
        </div>
      ) : null}

      <TextField
        id="login-username"
        label="Username"
        name="username"
        autoComplete="username"
        placeholder="your username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        error={errors.username}
        disabled={submitting}
        required
      />

      <PasswordField
        id="login-password"
        label="Password"
        name="password"
        autoComplete="current-password"
        placeholder="your password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        disabled={submitting}
        required
      />

      <Button type="submit" size="lg" fullWidth loading={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}