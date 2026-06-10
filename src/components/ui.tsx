import { useState } from "react";
import type { ReactNode } from "react";
import { KeyRound } from "lucide-react";
import { passwordIssues } from "@/lib/types";

export function InfoStrip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 truncate font-mono text-lg font-black text-white">{value}</p>
    </div>
  );
}

export function StatusBadge({ label, classes }: { label: string; classes: string }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${classes}`}>
      {label}
    </span>
  );
}

export function SectionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 ${className}`}>{children}</section>;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

export const inputClasses =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60";

export function LiveDot() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
    </span>
  );
}

/** Shared change-password form used by both player profile and admin security tab. */
export function PasswordChangeForm({
  accent = "cyan",
  onChangePassword,
}: {
  accent?: "cyan" | "violet";
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const issues = passwordIssues(next);
  const buttonClass =
    accent === "cyan"
      ? "bg-cyan-300 hover:bg-white"
      : "bg-violet-300 hover:bg-white";

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        if (next !== confirm) {
          setMessage({ kind: "err", text: "New passwords do not match." });
          return;
        }
        setBusy(true);
        const error = await onChangePassword(current, next);
        setBusy(false);
        if (error) {
          setMessage({ kind: "err", text: error });
        } else {
          setMessage({ kind: "ok", text: "Password changed successfully. Use the new password on your next login." });
          setCurrent("");
          setNext("");
          setConfirm("");
        }
      }}
    >
      <div className="space-y-4">
        <Field label="Current password">
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClasses} autoComplete="current-password" />
        </Field>
        <Field label="New password">
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClasses} autoComplete="new-password" />
        </Field>
        {next && (
          <div className="grid grid-cols-2 gap-2">
            {["At least 8 characters", "One uppercase letter", "One lowercase letter", "One number"].map((rule) => {
              const met = !issues.includes(rule);
              return (
                <span key={rule} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${met ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-slate-950/60 text-slate-500"}`}>
                  {met ? "✓" : "•"} {rule}
                </span>
              );
            })}
          </div>
        )}
        <Field label="Confirm new password">
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={`${inputClasses} ${confirm && confirm !== next ? "border-red-400/60" : ""}`} autoComplete="new-password" />
        </Field>
      </div>
      {message && (
        <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${message.kind === "ok" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>
          {message.text}
        </p>
      )}
      <button disabled={busy} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition disabled:bg-slate-700 disabled:text-slate-400 ${buttonClass}`}>
        <KeyRound className="h-4 w-4" />
        {busy ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}
