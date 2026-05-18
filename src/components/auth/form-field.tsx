import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const fieldClassName =
  "mt-1.5 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20";

type FormFieldProps = {
  label: string;
  name: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField({
  label,
  name,
  error,
  className,
  ...props
}: FormFieldProps) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-zinc-300">{label}</span>
      <input
        name={name}
        className={[fieldClassName, className].filter(Boolean).join(" ")}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  options: { value: string; label: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>;

export function SelectField({
  label,
  name,
  options,
  className,
  ...props
}: SelectFieldProps) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-zinc-300">{label}</span>
      <select
        name={name}
        className={[fieldClassName, className].filter(Boolean).join(" ")}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FormAlert({
  variant,
  message,
}: {
  variant: "error" | "success";
  message: string;
}) {
  const styles =
    variant === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

  return (
    <p
      role="alert"
      className={`rounded-md border px-3 py-2 text-sm ${styles}`}
    >
      {message}
    </p>
  );
}

export const submitButtonClassName =
  "inline-flex w-full items-center justify-center rounded-md bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60";
