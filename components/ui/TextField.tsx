import type { InputHTMLAttributes } from "react";
import { AlertCircle } from "@/components/icons";
import styles from "./Field.module.css";

export type TextFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function TextField({
  id,
  label,
  error,
  hint,
  className,
  ...inputProps
}: TextFieldProps) {
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
      <input
        id={id}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
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