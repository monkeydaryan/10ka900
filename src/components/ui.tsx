// MARKET 90XX - ui.tsx - 91 Club Mobile UI Reskin
// All logic 100% untouched - only Tailwind classes changed to light theme
// Drop-in replacement for src/components/ui.tsx

import { forwardRef, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Info, ChevronDown, X } from "lucide-react";

// ─── Shared input class ───────────────────────────────────────────────────────
export const inputClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#e53935] focus:ring-1 focus:ring-[#e53935]/20 disabled:cursor-not-allowed disabled:opacity-50";

// ─── LiveDot ──────────────────────────────────────────────────────────────────
export function LiveDot() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-[0.15em]">Live</span>
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
// API kept: { label, classes }
// classes from lib/types will still be appended, so old dark classes may need updating in types.ts
export function StatusBadge({ label, classes }: { label: string; classes: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${classes}`}>
      {label}
    </span>
  );
}

// ─── InfoStrip ────────────────────────────────────────────────────────────────
export function InfoStrip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50 transition">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900 truncate">{value}</p>
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────
export function SectionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── Field Component ──────────────────────────────────────────────────────────
export const Field = forwardRef<
  HTMLDivElement,
  {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: ReactNode;
  }
>(({ label, error, hint, required, children }, ref) => (
  <div ref={ref} className="space-y-2">
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-2 text-xs text-red-600">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {error}
      </p>
    )}
    {hint && !error && (
      <p className="text-xs text-slate-500">{hint}</p>
    )}
  </div>
));
Field.displayName = "Field";

// ─── Alert Box ────────────────────────────────────────────────────────────────
export function AlertBox({
  type = "info",
  title,
  message,
  onDismiss,
  autoClose = 0,
}: {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  onDismiss?: () => void;
  autoClose?: number;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onDismiss]);

  if (!isVisible) return null;

  const typeConfig = {
    info: { icon: Info, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", title: "text-blue-900" },
    success: { icon: CheckCircle2, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", title: "text-emerald-900" },
    warning: { icon: AlertCircle, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", title: "text-amber-900" },
    error: { icon: AlertCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-800", title: "text-red-900" },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} p-4`} role="alert">
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 shrink-0 ${config.text} mt-0.5`} />
        <div className="min-w-0 flex-1">
          {title && <p className={`font-semibold ${config.title}`}>{title}</p>}
          <p className={`text-sm leading-6 ${config.text}`}>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={() => { setIsVisible(false); onDismiss(); }}
            className={`ml-3 shrink-0 text-lg leading-none ${config.text} transition hover:opacity-70`}
            aria-label="Dismiss alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
export function Skeleton({ count = 1, className = "" }: { count?: number; className?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded-2xl border border-slate-200 bg-slate-100 h-12 ${className}`} />
      ))}
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className="h-full w-full animate-spin rounded-full border-4 border-slate-200 border-t-[#e53935]" />
    </div>
  );
}

// ─── PasswordChangeForm ───────────────────────────────────────────────────────
// accent prop kept for compatibility: violet/cyan/emerald -> all map to red primary
export function PasswordChangeForm({
  accent,
  onChangePassword,
}: {
  accent: "violet" | "cyan" | "emerald";
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(newPassword);
  const strengthColor = {
    0: "bg-slate-200",
    1: "bg-red-500",
    2: "bg-amber-500",
    3: "bg-yellow-500",
    4: "bg-emerald-500",
    5: "bg-green-600",
  };

  // map all accents to red primary for 91 Club look
  const accentBtn = "bg-[#e53935] text-white hover:bg-[#c62828]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword.trim()) { setError("Current password is required."); return; }
    if (!newPassword.trim()) { setError("New password is required."); return; }
    if (newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("New passwords do not match."); return; }
    if (currentPassword === newPassword) { setError("New password must be different from current password."); return; }

    setLoading(true);
    try {
      const result = await onChangePassword(currentPassword, newPassword);
      if (result) {
        setError(result);
      } else {
        setSuccess(true);
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        setShowCurrent(false); setShowNew(false); setShowConfirm(false);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Current password */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Current password *</label>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClasses}
            placeholder="Enter current password"
            autoComplete="current-password"
            disabled={loading}
            required
          />
          <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label={showCurrent ? "Hide" : "Show"} tabIndex={-1}>
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* New password */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">New password *</label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClasses}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            disabled={loading}
            required
          />
          <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" tabIndex={-1}>
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {newPassword && (
          <div className="mt-3 space-y-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthColor[strength as keyof typeof strengthColor] : "bg-slate-200"}`} />
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Password strength:{" "}
              <span className={strength === 5 ? "text-green-600" : strength >= 3 ? "text-amber-600" : "text-red-600"}>
                {["Very weak","Weak","Fair","Good","Strong","Very strong"][strength]}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Confirm */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm new password *</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`${inputClasses} ${confirmPassword && newPassword !== confirmPassword ? "!border-red-400" : ""}`}
            placeholder="Repeat new password"
            autoComplete="new-password"
            disabled={loading}
            required
          />
          <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" tabIndex={-1}>
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {confirmPassword && newPassword === confirmPassword && (
            <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
          )}
        </div>
      </div>

      {error && <AlertBox type="error" message={error} onDismiss={() => setError(null)} />}
      {success && (
        <AlertBox type="success" title="Success!" message="Your password has been changed successfully." autoClose={5000} onDismiss={() => setSuccess(false)} />
      )}

      <button
        type="submit"
        disabled={loading || !currentPassword || !newPassword || !confirmPassword}
        className={`w-full rounded-xl px-5 py-3 text-sm font-black uppercase tracking-[0.15em] transition ${accentBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" className="!h-4 !w-4" />
            Updating…
          </span>
        ) : "Update password"}
      </button>
    </form>
  );
}

// ─── Button Component ─────────────────────────────────────────────────────────
export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const variantClasses = {
    primary: "bg-[#e53935] text-white hover:bg-[#c62828]",
    secondary: "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };
  return (
    <button
      disabled={disabled || loading}
      className={`rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="sm" className="!h-4 !w-4" />
          Loading…
        </span>
      ) : children}
    </button>
  );
}

// ─── Badge Component ──────────────────────────────────────────────────────────
export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}) {
  const variantClasses = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({
  value,
  max = 100,
  className = "",
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className={`h-2 rounded-full bg-slate-200 overflow-hidden ${className}`}>
      <div className="h-full bg-[#e53935] transition-all duration-300 ease-out" style={{ width: `${percentage}%` }} />
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ className = "" }: { className?: string }) {
  return <div className={`border-t border-slate-200 ${className}`} />;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
export function Tooltip({
  children,
  content,
  side = "top",
}: {
  children: ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sideClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute ${sideClasses[side]} z-50 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white shadow-lg whitespace-nowrap pointer-events-none`}>
          {content}
        </div>
      )}
    </div>
  );
}

// ─── Collapsible ──────────────────────────────────────────────────────────────
export function Collapsible({
  title,
  children,
  defaultOpen = false,
  icon: Icon,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: any;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-[#e53935] shrink-0" />}
          <p className="font-semibold text-slate-900 text-left">{title}</p>
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="border-t border-slate-100 px-5 py-4 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  isOpen,
  title,
  children,
  onClose,
  size = "md",
  showCloseButton = true,
}: {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}) {
  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = "auto"; }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={`${sizeClasses[size]} w-full rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          {showCloseButton && (
            <button onClick={onClose} className="text-slate-400 transition hover:text-slate-700" aria-label="Close modal">
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
export const Checkbox = forwardRef<
  HTMLInputElement,
  { label?: string; error?: string; [key: string]: any }
>(({ label, error, ...props }, ref) => (
  <div className="space-y-2">
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        ref={ref}
        type="checkbox"
        className="h-5 w-5 rounded border border-slate-300 bg-white accent-[#e53935] cursor-pointer transition focus:ring-2 focus:ring-[#e53935]/20"
        {...props}
      />
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
    </label>
    {error && (
      <p className="flex items-center gap-2 text-xs text-red-600">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
));
Checkbox.displayName = "Checkbox";

// ─── Radio Group ──────────────────────────────────────────────────────────────
export function RadioGroup({
  options,
  value,
  onChange,
  label,
  error,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}) {
  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-semibold text-slate-700">{label}</p>}
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 accent-[#e53935] cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = forwardRef<
  HTMLSelectElement,
  {
    options: { label: string; value: string }[];
    placeholder?: string;
    label?: string;
    error?: string;
    [key: string]: any;
  }
>(({ options, placeholder, label: labelText, error, ...props }, ref) => (
  <div className="space-y-2">
    {labelText && <p className="text-sm font-semibold text-slate-700">{labelText}</p>}
    <div className="relative">
      <select ref={ref} className={`${inputClasses} appearance-none pr-10`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
    {error && (
      <p className="flex items-center gap-2 text-xs text-red-600">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
));
Select.displayName = "Select";

// ─── Textarea ─────────────────────────────────────────────────────────────────
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  {
    label?: string;
    error?: string;
    hint?: string;
    maxLength?: number;
    [key: string]: any;
  }
>(({ label, error, hint, maxLength, ...props }, ref) => {
  const [charCount, setCharCount] = useState(0);
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-semibold text-slate-700">{label}</p>}
      <textarea
        ref={ref}
        maxLength={maxLength}
        onChange={(e) => {
          setCharCount(e.target.value.length);
          props.onChange?.(e);
        }}
        className={`${inputClasses} resize-none min-h-[120px]`}
        {...props}
      />
      <div className="flex items-center justify-between">
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {maxLength && (
          <p className={`text-xs ml-auto ${charCount >= maxLength * 0.9 ? "text-amber-600" : charCount === maxLength ? "text-red-600" : "text-slate-400"}`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});
Textarea.displayName = "Textarea";

// ─── InputWithIcon ────────────────────────────────────────────────────────────
export function InputWithIcon({
  icon: Icon,
  error,
  label,
  ...props
}: {
  icon: any;
  error?: string;
  label?: string;
  [key: string]: any;
}) {
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-semibold text-slate-700">{label}</p>}
      <div className="relative">
        <Icon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
        <input {...props} className={`${inputClasses} pl-10`} />
      </div>
      {error && (
        <p className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: any;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      {Icon && <Icon className="mx-auto mb-4 h-12 w-12 text-slate-400" />}
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {description && <p className="mt-2 text-slate-500">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-xl bg-[#e53935] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c62828]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
export function StatsCard({
  label,
  value,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon?: any;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 hover:bg-slate-50 transition shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900 truncate">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-semibold ${trend.isPositive ? "text-emerald-600" : "text-red-600"}`}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-full bg-red-50 p-3 shrink-0">
            <Icon className="h-6 w-6 text-[#e53935]" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab Group ────────────────────────────────────────────────────────────────
export function TabGroup({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: { id: string; label: string; badge?: number }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === tab.id
              ? "border-[#e53935] text-[#e53935]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
          {tab.badge ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">{tab.badge}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────
export function CodeBlock({
  code,
  language = "javascript",
  showLineNumbers = true,
  copyable = true,
}: {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
        <span className="text-xs text-slate-400 uppercase tracking-[0.15em] font-semibold">{language}</span>
        {copyable && (
          <button onClick={handleCopy} className="text-xs text-slate-400 hover:text-white transition">
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="font-mono text-sm text-slate-200">
          {code.split("\n").map((line, i) => (
            <div key={i} className="flex gap-4">
              {showLineNumbers && (
                <span className="text-slate-600 select-none w-8 text-right">{String(i + 1).padStart(2, "0")}</span>
              )}
              <span>{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

// ─── Card Grid ────────────────────────────────────────────────────────────────
export function CardGrid({
  children,
  columns = 3,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
}) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };
  return <div className={`grid gap-4 ${columnClasses[columns]}`}>{children}</div>;
}
