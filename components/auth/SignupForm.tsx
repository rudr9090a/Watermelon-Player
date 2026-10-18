"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, CheckCircle } from "@/components/icons";
import { ApiError, signup } from "@/lib/api";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import styles from "./AuthForm.module.css";

type FieldErrors = {
  username?: string;
  password?: string;
  confirmPassword?: string;
};

  // Frontend-only policy. Watermelon's API does not enforce a password length, so
// these rules are deliberately shown as client-side guidance only.
const MIN_PASSWORD_LENGTH = 8;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 32;

export function SignupForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const trimmed = username.trim();

    if (!trimmed) {
      next.username = "Choose a username.";
    } else if (trimmed.length < MIN_USERNAME_LENGTH) {
      next.username = `Use at least ${MIN_USERNAME_LENGTH} characters.`;
    } else if (trimmed.length > MAX_USERNAME_LENGTH) {
      next.username = `Use at most ${MAX_USERNAME_LENGTH} characters.`;
    }

    if (!password) {
      next.password = "Choose a password.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (!confirmPassword) {
      next.confirmPassword = "Re-enter your password.";
    } else if (password && confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match.";
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
      await signup({ username: username.trim(), password });
      // Watermelon creates the account but does not start a session, so the user
      // signs in afterwards.
      setCreated(true);
      setSubmitting(false);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon}>
          <CheckCircle size={24} />
        </span>
        <h2 className={styles.successTitle}>Account created</h2>
        <p className={styles.successText}>
          Your account is ready. Head over to the sign-in page to start using it.
        </p>
        <div className={styles.successActions}>
          <ButtonLink href="/login" size="lg" fullWidth>
            Continue to sign in
          </ButtonLink>
        </div>
      </div>
    );
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
        id="signup-username"
        label="Username"
        name="username"
        autoComplete="username"
        placeholder="pick a username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        error={errors.username}
        hint={
          errors.username
            ? undefined
            : `${MIN_USERNAME_LENGTH}–${MAX_USERNAME_LENGTH} characters.`
        }
        disabled={submitting}
        required
      />

      <PasswordField
        id="signup-password"
        label="Password"
        name="password"
        autoComplete="new-password"
        placeholder="create a password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        hint={
          errors.password
            ? undefined
            : `At least ${MIN_PASSWORD_LENGTH} characters.`
        }
        disabled={submitting}
        required
      />

      <PasswordField
        id="signup-confirm-password"
        label="Confirm password"
        name="confirm-password"
        autoComplete="new-password"
        placeholder="repeat your password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={errors.confirmPassword}
        disabled={submitting}
        required
      />

      <Button type="submit" size="lg" fullWidth loading={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
