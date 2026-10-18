import styles from "./Spinner.module.css";

type SpinnerProps = {
  className?: string;
  label?: string;
};

/**
 * A tiny, currentColor-driven loading indicator. It scales with the parent
 * font-size (1em) so it can be dropped into buttons and cards alike.
 */
export function Spinner({ className, label }: SpinnerProps) {
  return (
    <span
      className={[styles.spinner, className].filter(Boolean).join(" ")}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}