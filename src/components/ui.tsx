import { forwardRef, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Info, ChevronDown, X } from "lucide-react";

// ─── Shared input class string ────────────────────────────────────────────────

export const inputClasses =
  "w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-300/60 focus:ring-1 focus:ring-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50";

// ─── LiveDot ──────────────────────────────────────────────────────────────────

export function LiveDot() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </span>
      <span className="text-xs font-semibold text-emerald-300 uppercase tracking-[0.15em]">Live</span>
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

export function StatusBadge({ label, classes }: { label: string; classes: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] ${classes}`}>
      {label}
    </span>
  );
}

// ─── InfoStrip ────────────────────────────────────────────────────────────────

export function InfoStrip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white truncate">{value}</p>
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
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm hover:bg-white/[0.05] transition ${className}`}
    >
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
      <span className="text-sm font-semibold text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </span>
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-2 text-xs text-red-300">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {error}
      </p>
    )}
    {hint && !error && (
      <p className="text-xs text-slate-400">{hint}</p>
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
    info: {
      icon: Info,
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/30",
      textColor: "text-blue-200",
      titleColor: "text-blue-100",
    },
    success: {
      icon: CheckCircle2,
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/30",
      textColor: "text-emerald-200",
      titleColor: "text-emerald-100",
    },
    warning: {
      icon: AlertCircle,
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/30",
      textColor: "text-amber-200",
      titleColor: "text-amber-100",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-400/10",
      borderColor: "border-red-400/30",
      textColor: "text-red-200",
      titleColor: "text-red-100",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-2xl border ${config.borderColor} ${config.bgColor} p-4 backdrop-blur-sm animate-fade-up`}
      role="alert"
    >
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 shrink-0 ${config.textColor} mt-0.5`} />
        <div className="min-w-0 flex-1">
          {title && <p className={`font-semibold ${config.titleColor}`}>{title}</p>}
          <p className={`text-sm leading-6 ${config.textColor}`}>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className={`ml-3 shrink-0 text-lg leading-none ${config.textColor} transition hover:opacity-70`}
            aria-label="Dismiss alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

export function Skeleton({ count = 1, className = "" }: { count?: number; className?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-2xl border border-white/10 bg-slate-900/50 h-12 ${className}`}
        />
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
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className="h-full w-full animate-spin rounded-full border-4 border-slate-700 border-t-cyan-300" />
    </div>
  );
}

// ─── PasswordChangeForm ────────────────────────────────────────────────────────

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

  // Password strength indicator
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
    0: "bg-slate-700",
    1: "bg-red-500",
    2: "bg-amber-500",
    3: "bg-yellow-500",
    4: "bg-emerald-500",
    5: "bg-green-500",
  };

  const accentBtn =
    accent === "violet"
      ? "bg-violet-300 text-slate-950 hover:bg-white"
      : accent === "cyan"
      ? "bg-cyan-300 text-slate-950 hover:bg-white"
      : "bg-emerald-400 text-slate-950 hover:bg-emerald-300";

  const accentBorder =
    accent === "violet"
      ? "focus:border-violet-300/60 focus:ring-violet-300/20"
      : accent === "cyan"
      ? "focus:border-cyan-300/60 focus:ring-cyan-300/20"
      : "focus:border-emerald-300/60 focus:ring-emerald-300/20";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation checks
    if (!currentPassword.trim()) {
      setError("Current password is required.");
      return;
    }
    if (!newPassword.trim()) {
      setError("New password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setLoading(true);
    try {
      const result = await onChangePassword(currentPassword, newPassword);

      if (result) {
        setError(result);
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
        
        // Auto-dismiss success after 5 seconds
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
        <label className="mb-2 block text-sm font-semibold text-slate-300">Current password *</label>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={`${inputClasses} ${accentBorder}`}
            placeholder="Enter current password"
            autoComplete="current-password"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
            aria-label={showCurrent ? "Hide current password" : "Show current password"}
            tabIndex={-1}
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* New password */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-300">New password *</label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`${inputClasses} ${accentBorder}`}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
            aria-label={showNew ? "Hide new password" : "Show new password"}
            tabIndex={-1}
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Password strength indicator */}
        {newPassword && (
          <div className="mt-3 space-y-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < strength ? strengthColor[strength as keyof typeof strengthColor] : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Password strength:{" "}
              <span className={strength === 5 ? "text-green-400" : strength >= 3 ? "text-amber-400" : "text-red-400"}>
                {strength === 0 && "Very weak"}
                {strength === 1 && "Weak"}
                {strength === 2 && "Fair"}
                {strength === 3 && "Good"}
                {strength === 4 && "Strong"}
                {strength === 5 && "Very strong"}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Confirm new password */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-300">Confirm new password *</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`${inputClasses} ${accentBorder} ${
              confirmPassword && newPassword !== confirmPassword ? "border-red-400/60" : ""
            }`}
            placeholder="Repeat new password"
            autoComplete="new-password"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
            aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {confirmPassword && newPassword === confirmPassword && (
            <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
          )}
        </div>
      </div>

      {error && (
        <AlertBox
          type="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}
      {success && (
        <AlertBox
          type="success"
          title="Success!"
          message="Your password has been changed successfully. You can now login with your new password."
          autoClose={5000}
          onDismiss={() => setSuccess(false)}
        />
      )}

      <button
        type="submit"
        disabled={loading || !currentPassword || !newPassword || !confirmPassword}
        className={`w-full rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-[0.2em] transition ${accentBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" className="!h-4 !w-4" />
            Updating…
          </span>
        ) : (
          "Update password"
        )}
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
    primary: "bg-cyan-300 text-slate-950 hover:bg-white",
    secondary: "border border-white/10 text-slate-300 hover:border-white/40 hover:text-white hover:bg-white/5",
    danger: "bg-red-500 text-white hover:bg-red-400",
    ghost: "text-slate-300 hover:text-white hover:bg-white/5",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="sm" className="!h-4 !w-4" />
          Loading…
        </span>
      ) : (
        children
      )}
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
    default: "bg-slate-950/60 text-slate-300 border-white/10",
    success: "bg-emerald-400/10 text-emerald-200 border-emerald-400/30",
    warning: "bg-amber-400/10 text-amber-200 border-amber-400/30",
    error: "bg-red-400/10 text-red-200 border-red-400/30",
    info: "bg-blue-400/10 text-blue-200 border-blue-400/30",
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
    <div className={`h-2 rounded-full bg-slate-900 overflow-hidden ${className}`}>
      <div
        className="h-full bg-cyan-300 transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// ─── Divider Component ────────────────────────────────────────────────────────

export function Divider({ className = "" }: { className?: string }) {
  return <div className={`border-t border-white/10 ${className}`} />;
}

// ─── Tooltip Component ────────────────────────────────────────────────────────

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
        <div
          className={`absolute ${sideClasses[side]} z-50 rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-200 border border-white/10 whitespace-nowrap shadow-lg animate-fade-up pointer-events-none`}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// ─── Collapsible Component ────────────────────────────────────────────────────

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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-cyan-200 shrink-0" />}
          <p className="font-semibold text-white text-left">{title}</p>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="border-t border-white/10 px-5 py-4 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Modal Component ──────────────────────────────────────────────────────────

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
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-up"
      onClick={onClose}
    >
      <div
        className={`${sizeClasses[size]} w-full rounded-[2rem] border border-white/10 bg-slate-950 p-6 shadow-2xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-slate-400 transition hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Checkbox Component ───────────────────────────────────────────────────────

export const Checkbox = forwardRef<
  HTMLInputElement,
  {
    label?: string;
    error?: string;
    [key: string]: any;
  }
>(({ label, error, ...props }, ref) => (
  <div className="space-y-2">
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        ref={ref}
        type="checkbox"
        className="h-5 w-5 rounded border border-white/10 bg-slate-900/80 accent-cyan-300 cursor-pointer transition focus:ring-2 focus:ring-cyan-300/20"
        {...props}
      />
      {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
    </label>
    {error && (
      <p className="flex items-center gap-2 text-xs text-red-300">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
));

Checkbox.displayName = "Checkbox";

// ─── Radio Group Component ────────────────────────────────────────────────────

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
      {label && <p className="text-sm font-semibold text-slate-300">{label}</p>}
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 accent-cyan-300 cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-300">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Select Component ─────────────────────────────────────────────────────────

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
    {labelText && <p className="text-sm font-semibold text-slate-300">{labelText}</p>}
    <div className="relative">
      <select
        ref={ref}
        className={`${inputClasses} appearance-none pr-10`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
    {error && (
      <p className="flex items-center gap-2 text-xs text-red-300">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
));

Select.displayName = "Select";

// ─── Textarea Component ───────────────────────────────────────────────────────

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
      {label && <p className="text-sm font-semibold text-slate-300">{label}</p>}
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
        {hint && !error && (
          <p className="text-xs text-slate-400">{hint}</p>
        )}
        {maxLength && (
          <p className={`text-xs ml-auto ${charCount >= maxLength * 0.9 ? "text-amber-400" : charCount === maxLength ? "text-red-400" : "text-slate-400"}`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

// ─── InputWithIcon Component ──────────────────────────────────────────────────

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
      {label && <p className="text-sm font-semibold text-slate-300">{label}</p>}
      <div className="relative">
        <Icon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
        <input
          {...props}
          className={`${inputClasses} pl-10`}
        />
      </div>
      {error && (
        <p className="flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Empty State Component ────────────────────────────────────────────────────

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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
      {Icon && (
        <Icon className="mx-auto mb-4 h-12 w-12 text-slate-400" />
      )}
      <h3 className="text-lg font-bold text-white">{title}</h3>
      {description && (
        <p className="mt-2 text-slate-400">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─── Stats Card Component ─────────────────────────────────────────────────────

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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-white truncate">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-semibold ${trend.isPositive ? "text-emerald-300" : "text-red-300"}`}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-full bg-cyan-300/10 p-3 shrink-0">
            <Icon className="h-6 w-6 text-cyan-200" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab Group Component ──────────────────────────────────────────────────────

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
    <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === tab.id
              ? "border-cyan-300 text-cyan-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          {tab.label}
          {tab.badge && (
            <Badge variant="info" className="!px-2 !py-0.5">
              {tab.badge}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Code Block Component ─────────────────────────────────────────────────────

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
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 overflow-hidden">
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
        <span className="text-xs text-slate-400 uppercase tracking-[0.15em] font-semibold">
          {language}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="text-xs text-slate-400 hover:text-white transition"
            title="Copy to clipboard"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="font-mono text-sm text-slate-200">
          {code.split("\n").map((line, i) => (
            <div key={i} className="flex gap-4">
              {showLineNumbers && (
                <span className="text-slate-600 select-none w-8 text-right">
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              <span>{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

// ─── Card Grid Component ──────────────────────────────────────────────────────

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

  return (
    <div className={`grid gap-4 ${columnClasses[columns]}`}>
      {children}
    </div>
  );
}