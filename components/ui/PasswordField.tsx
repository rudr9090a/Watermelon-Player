"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { AlertCircle, Eye, EyeOff } from "@/components/icons";
import styles from "./Field.module.css";

export type PasswordFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordField({
  id,
  label,
  error,
  hint,
  className,
  ...inputProps
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const describedBy = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;

  return (
    <div
      className={[styles.field, error && styles.hasError, className]
        .filter(Boolean)
        .join(" ")}
    >
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={`${styles.input} ${styles.withToggle}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className={`${styles.message} ${styles.error}`} role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={`${styles.message} ${styles.hint}`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}