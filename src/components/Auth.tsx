// MARKET 90XX - Auth.tsx - 91 Club Mobile UI Reskin
// Game/auth logic is 100% untouched - only UI changed
// Drop-in replacement for src/components/Auth.tsx

import { useState } from "react";
import type { ReactNode } from "react";
import { Activity, LockKeyhole, MailCheck, Shield, ShieldCheck, Smartphone, UserPlus, UserRound } from "lucide-react";
import { API_BASE, BRAND, MAX_DOUBLE_BET, MIN_DEPOSIT, MIN_WITHDRAW, generateOtp, passwordIssues } from "@/lib/types";
import { Field } from "@/components/ui";

// Simple mobile input style to match Dashboard.91club.tsx
const mInput = "w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-[15px] outline-none focus:border-[#e53935]";
const mBtnPrimary = "w-full rounded-xl bg-[#e53935] px-4 py-3.5 text-sm font-black text-white hover:bg-[#c62828] transition disabled:bg-slate-300 disabled:text-slate-500";
const mBtnGhost = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50";

/* ------------------------------------------------------------------ */
/* Landing                                                            */
/* ------------------------------------------------------------------ */

export function Landing({
  onLogin,
  onRegister,
  onAdmin,
}: {
  onLogin: () => void;
  onRegister: () => void;
  onAdmin: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#e8e8e8] flex justify-center text-slate-900">
      <div className="w-full max-w-[420px] bg-[#f5f5f7] min-h-screen relative flex flex-col">
        <div className="flex-1 px-5 pt-14 pb-8 flex flex-col">
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#e53935] text-white flex items-center justify-center shadow-lg">
              <Activity className="h-7 w-7" />
            </div>
            <div className="mt-3 font-black text-[22px] tracking-wide">
              MARKET <span className="text-[#e53935]">90XX</span>
            </div>
            <div className="text-slate-500 text-sm">Decimal close gaming</div>
          </div>

          <div className="mt-10 bg-gradient-to-br from-[#ff5a4a] to-[#e53935] text-white rounded-[24px] p-6 shadow-lg">
            <div className="text-xs uppercase tracking-widest opacity-90">Real-credit markets</div>
            <h1 className="text-[34px] font-black leading-tight mt-1">Market<br/>90XX</h1>
            <p className="mt-3 text-white/90 text-[14px] leading-relaxed">
              Wager on the exact closing decimals. OTP-secured, instant payouts, admin-verified wallet.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="bg-white rounded-xl border border-slate-200 p-3">Double match<br/><b>90x payout</b></div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">Min deposit<br/><b>{MIN_DEPOSIT} credits</b></div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">Min withdraw<br/><b>{MIN_WITHDRAW} credits</b></div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">Max double bet<br/><b>{MAX_DOUBLE_BET}</b></div>
          </div>

          <div className="mt-auto pt-8 space-y-2.5">
            <button onClick={onRegister} className={mBtnPrimary + " !py-4 text-[15px]"}>
              Create account
            </button>
            <button onClick={onLogin} className={mBtnGhost}>
              Player Login
            </button>
            <button onClick={onAdmin} className="w-full text-center text-[12px] text-slate-500 py-2">
              Admin console
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-400 mt-3">18+ · Play Responsibly</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared shell                                                       */
/* ------------------------------------------------------------------ */

export function AuthShell({
  title,
  headline,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  headline: string;
  subtitle: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#e8e8e8] flex justify-center text-slate-900">
      <div className="w-full max-w-[420px] bg-[#f5f5f7] min-h-screen">
        <div className="px-4 py-4">
          <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800">← Back to {BRAND}</button>
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-widest text-[#e53935] font-bold">{title}</p>
            <h1 className="text-[26px] font-black text-slate-900">{headline}</h1>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* OTP helper - LOGIC UNCHANGED                                       */
/* ------------------------------------------------------------------ */

const dispatchOtp = async (destination: string, otp: string, channel: "email" | "sms") => {
  try {
    await fetch(`${API_BASE}/send-otp.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, otp, channel }),
    });
  } catch (error) {
    console.error("Failed to send OTP:", error);
  }
};

function OtpVerifier({
  destination,
  channel,
  onVerified,
  onResendNote,
}: {
  destination: string;
  channel: "email" | "sms";
  onVerified: () => void;
  onResendNote: string;
}) {
  const [expected, setExpected] = useState(() => {
    const otp = generateOtp();
    void dispatchOtp(destination, otp, channel);
    return otp;
  });
  const [entered, setEntered] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const handleVerify = () => {
    if (entered === expected) {
      onVerified();
    } else {
      setAttempts((prev) => prev + 1);
      if (attempts >= 4) {
        setError("Too many failed attempts. Please request a new OTP.");
        setEntered("");
      } else {
        setError(`That OTP does not match. ${5 - attempts - 1} attempts remaining.`);
      }
    }
  };

  return (
    <div className="bg-white rounded-[18px] border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-sm mb-3">
        {channel === "email" ? <MailCheck className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
        <span>OTP sent to <b>{destination}</b></span>
      </div>
      <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <b>Demo OTP:</b> <span className="font-mono text-lg font-black tracking-widest">{expected}</span>
        <br/>In production this is sent via SMS and never shown here.
      </div>
      <Field label="Enter the 6-digit OTP">
        <input
          value={entered}
          inputMode="numeric"
          maxLength={6}
          onChange={(event) => setEntered(event.target.value.replace(/\D/g, "").slice(0, 6))}
          className={mInput + " text-center font-mono text-2xl tracking-widest"}
          placeholder="••••••"
          disabled={attempts >= 5}
        />
      </Field>
      {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button
        onClick={handleVerify}
        disabled={entered.length !== 6 || attempts >= 5}
        className={mBtnPrimary + " mt-3"}
      >
        Verify OTP
      </button>
      <button
        onClick={() => {
          const otp = generateOtp();
          setExpected(otp);
          setEntered("");
          setError("");
          setAttempts(0);
          void dispatchOtp(destination, otp, channel);
        }}
        className={mBtnGhost + " mt-2"}
      >
        Resend OTP
      </button>
      <p className="mt-3 text-xs text-slate-500">{onResendNote}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Registration - LOGIC UNCHANGED                                     */
/* ------------------------------------------------------------------ */

export function RegisterScreen({
  onBack,
  onRegistered,
}: {
  onBack: () => void;
  onRegistered: (name: string, phone: string, password: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [error, setError] = useState("");

  const issues = passwordIssues(password);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (cleanPhone.length < 10) { setError("Please enter a valid phone number."); return; }
    if (issues.length > 0) { setError("Your password does not meet the security requirements yet."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError("");
    setStep("otp");
  };

  return (
    <AuthShell
      title="Create account"
      headline="Register securely."
      subtitle="Phone OTP verification. Every registration is reported to the platform owner."
      onBack={onBack}
    >
      {step === "form" ? (
        <div className="bg-white rounded-[18px] border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
            <UserPlus className="h-5 w-5 text-[#e53935]" /> New player registration
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={mInput} placeholder="Your name" autoComplete="name" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Phone number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={mInput} placeholder="+91 98765 43210" autoComplete="tel" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={mInput} placeholder="Create a strong password" autoComplete="new-password" />
            </div>
            {password && (
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {["At least 8 characters", "One uppercase letter", "One lowercase letter", "One number"].map((rule) => {
                  const met = !issues.includes(rule);
                  return (
                    <span key={rule} className={`rounded-lg border px-2 py-1.5 font-semibold ${met ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                      {met ? "✓" : "•"} {rule}
                    </span>
                  );
                })}
              </div>
            )}
            <div>
              <label className="text-xs text-slate-500">Confirm password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={mInput + (confirm && confirm !== password ? " !border-red-400" : "")} placeholder="Repeat the password" autoComplete="new-password" />
            </div>
            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" className={mBtnPrimary}>Send OTP &amp; verify</button>
          </form>
        </div>
      ) : (
        <OtpVerifier
          destination={phone}
          channel="sms"
          onVerified={() => onRegistered(name.trim(), phone.replace(/[^\d+]/g, ""), password)}
          onResendNote={`On success, your registration is forwarded to operations and a locked ${BRAND} User ID is generated.`}
        />
      )}
      <div className="mt-3 bg-white rounded-[18px] border border-slate-200 p-4 text-sm text-slate-600 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-slate-800 mb-1"><ShieldCheck className="h-5 w-5 text-[#e53935]" /> One identity. Fully audited.</div>
        OTP verified · Secure wallet · Salted password hashes
      </div>
    </AuthShell>
  );
}

/* ------------------------------------------------------------------ */
/* Player login - LOGIC UNCHANGED                                     */
/* ------------------------------------------------------------------ */

export function LoginScreen({
  onBack,
  onRegisterInstead,
  onLogin,
}: {
  onBack: () => void;
  onRegisterInstead: () => void;
  onLogin: (phone: string, password: string) => Promise<string | null>;
}) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    if (!cleanPhone) { setError("Please enter your phone number."); return; }
    if (!password) { setError("Please enter your password."); return; }
    setBusy(true);
    const result = await onLogin(cleanPhone, password);
    setBusy(false);
    if (result) setError(result);
  };

  return (
    <AuthShell
      title="Player login"
      headline="Welcome back."
      subtitle="Sign in with phone + password. 5 failed attempts = 5 min lockout."
      onBack={onBack}
    >
      <div className="bg-white rounded-[18px] border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 font-bold text-slate-800">
          <UserRound className="h-5 w-5 text-[#e53935]" /> Secure login
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-500">Registered phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={mInput} placeholder="+91 98765 43210" autoComplete="tel" disabled={busy} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={mInput} placeholder="Your password" autoComplete="current-password" disabled={busy} />
          </div>
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className={mBtnPrimary}>{busy ? "Checking…" : "Login"}</button>
          <button type="button" onClick={onRegisterInstead} disabled={busy} className={mBtnGhost}>New here? Create an account</button>
        </form>
      </div>
    </AuthShell>
  );
}

/* ------------------------------------------------------------------ */
/* Admin login - LOGIC UNCHANGED                                      */
/* ------------------------------------------------------------------ */

export function AdminLogin({
  onBack,
  onLogin,
}: {
  onBack: () => void;
  onLogin: (adminId: string, password: string) => Promise<boolean>;
}) {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!adminId.trim() || !password.trim()) { setError("Admin ID and password are required."); return; }
    setBusy(true);
    const success = await onLogin(adminId, password);
    setBusy(false);
    if (!success) { setError("Invalid admin credentials on local PHP server."); }
  };

  return (
    <AuthShell
      title="Admin access"
      headline="Operations control."
      subtitle="Live users, bets, deposits, withdrawals, and tickets."
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="bg-white rounded-[18px] border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 font-bold text-slate-800">
          <Shield className="h-5 w-5 text-[#e53935]" /> Admin login
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500">Admin ID</label>
            <input value={adminId} placeholder="admin" onChange={(e) => setAdminId(e.target.value)} className={mInput} disabled={busy} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Password</label>
            <input value={password} type="password" placeholder="Enter admin password" onChange={(e) => setPassword(e.target.value)} className={mInput} disabled={busy} />
          </div>
        </div>
        {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className={mBtnPrimary + " mt-3"}>{busy ? "Checking…" : "Unlock admin panel"}</button>
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><LockKeyhole className="h-4 w-4" /> Separate session namespace.</p>
      </form>
    </AuthShell>
  );
}
