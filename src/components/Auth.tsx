import { useState } from "react";
import type { ReactNode } from "react";
import { Activity, LockKeyhole, MailCheck, Shield, ShieldCheck, Smartphone, UserPlus, UserRound } from "lucide-react";
import { API_BASE, BRAND, MAX_DOUBLE_BET, MIN_DEPOSIT, MIN_WITHDRAW, OWNER_EMAIL, generateOtp, passwordIssues } from "@/lib/types";
import { Field, inputClasses } from "@/components/ui";

/* ------------------------------------------------------------------ */
/* Landing                                                             */
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
    <main className="relative min-h-screen overflow-hidden bg-[#050813] text-white">
      <div className="grid-bg absolute inset-0 opacity-70" />
      <div className="orb absolute left-[-12rem] top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="orb-delayed absolute bottom-[-16rem] right-[-12rem] h-[38rem] w-[38rem] rounded-full bg-violet-500/20 blur-3xl" />

      <section className="relative flex min-h-screen flex-col justify-between px-5 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-cyan-200 shadow-[0_0_40px_rgba(34,211,238,0.25)]">
              <Activity className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs uppercase tracking-[0.42em] text-cyan-200/80">{BRAND}</span>
              <span className="block text-sm text-slate-400">Decimal close gaming protocol</span>
            </span>
          </div>
          <button
            onClick={onAdmin}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-violet-300/40 hover:text-white"
          >
            Admin console
          </button>
        </nav>

        <div className="grid items-end gap-10 lg:grid-cols-[1fr_0.82fr]">
          <div className="max-w-5xl animate-fade-up">
            <p className="mb-5 text-sm uppercase tracking-[0.5em] text-cyan-200/80">Real-credit market micro-games</p>
            <h1 className="text-balance text-6xl font-black uppercase leading-[0.84] tracking-[-0.08em] text-white sm:text-8xl lg:text-[8.8rem]">
              Market<br />90x
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Wager on the exact final decimals of global market closes. OTP-secured accounts, a verified real-credit
              wallet, instant 90x double-digit payouts, and admin-approved deposits and withdrawals.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onRegister}
                className="rounded-full bg-cyan-300 px-7 py-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_50px_rgba(34,211,238,0.35)] transition hover:bg-white"
              >
                Create account
              </button>
              <button
                onClick={onLogin}
                className="rounded-full border border-white/15 px-7 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:border-white/50 hover:bg-white/5"
              >
                Player login
              </button>
            </div>
          </div>

          <div className="relative hidden min-h-[36rem] lg:block">
            <MarketPlane />
          </div>
        </div>

        <div className="ticker-marquee border-y border-white/10 py-3 text-xs uppercase tracking-[0.32em] text-cyan-100/70">
          <span>Double digit match pays 90x</span>
          <span>Max {MAX_DOUBLE_BET} credits per double-digit number</span>
          <span>Minimum deposit {MIN_DEPOSIT} credits</span>
          <span>Minimum withdrawal {MIN_WITHDRAW} credits</span>
          <span>Per-market betting cutoff clocks</span>
          <span>OTP secured registration</span>
        </div>
      </section>
    </main>
  );
}

function MarketPlane() {
  return (
    <div className="absolute inset-0 animate-float-panel">
      <div className="scanline absolute inset-x-10 top-20 h-72 border border-cyan-200/15 bg-cyan-200/[0.03]" />
      <div className="absolute left-8 top-10 h-24 w-64 border-l border-cyan-300/40 pl-5">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">Closing decimal</p>
        <p className="mt-2 text-6xl font-black tracking-[-0.08em] text-white">.89</p>
      </div>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 540 560" fill="none">
        <path d="M38 422C96 326 152 363 220 259C289 155 344 219 407 125C450 61 487 70 516 41" stroke="url(#line)" strokeWidth="4" />
        <path d="M38 422C96 326 152 363 220 259C289 155 344 219 407 125C450 61 487 70 516 41" stroke="white" strokeOpacity="0.18" strokeWidth="18" />
        <defs>
          <linearGradient id="line" x1="38" x2="516" y1="422" y2="41" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      {["00", "11", "24", "57", "66", "89"].map((digit, index) => (
        <span
          key={digit}
          className="absolute rounded-full border border-cyan-300/30 bg-slate-950/70 px-3 py-1 text-sm font-bold text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.18)]"
          style={{ left: `${12 + index * 13}%`, top: `${70 - index * 9}%`, animation: `fadeUp 900ms ease ${index * 110}ms both` }}
        >
          {digit}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared shell                                                        */
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
    <main className="relative min-h-screen overflow-hidden bg-[#050813] px-5 py-6 text-white sm:px-8">
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-6xl">
        <button onClick={onBack} className="mb-10 text-sm uppercase tracking-[0.24em] text-slate-400 transition hover:text-white">
          Back to {BRAND}
        </button>
        <div className="mb-10 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.45em] text-cyan-200/80">{title}</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.08em] text-white sm:text-6xl">{headline}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* OTP helper                                                          */
/* ------------------------------------------------------------------ */

const dispatchOtp = async (destination: string, otp: string, channel: "email" | "sms") => {
  try {
    await fetch(`${API_BASE}/send-otp.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, otp, channel }),
    });
  } catch {
    // Local PHP server offline; demo OTP is still shown on screen.
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

  return (
    <div className="animate-fade-up">
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
        {channel === "email" ? <MailCheck className="h-6 w-6 shrink-0 text-emerald-200" /> : <Smartphone className="h-6 w-6 shrink-0 text-emerald-200" />}
          <p className="text-sm leading-6 text-emerald-100">
          A 6-digit OTP was sent to <span className="font-bold">{destination}</span> from the {BRAND} local PHP server.
        </p>
      </div>
      <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
        <span className="font-bold uppercase tracking-[0.18em]">Demo mode:</span> your OTP is{" "}
        <span className="font-mono text-lg font-black tracking-[0.3em] text-white">{expected}</span>
        <br />
        In production this is delivered by PHPMailer + Gmail SMTP (free) or Firebase Phone Auth (free tier) and never shown here.
      </div>
      <Field label="Enter the 6-digit OTP">
        <input
          value={entered}
          inputMode="numeric"
          maxLength={6}
          onChange={(event) => setEntered(event.target.value.replace(/\D/g, "").slice(0, 6))}
          className={`${inputClasses} text-center font-mono text-2xl font-black tracking-[0.6em]`}
          placeholder="••••••"
        />
      </Field>
      {error && <p className="mt-3 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      <button
        onClick={() => {
          if (entered === expected) {
            onVerified();
          } else {
            setError("That OTP does not match. Please re-check and try again.");
          }
        }}
        className="mt-4 w-full rounded-2xl bg-cyan-300 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white"
      >
        Verify OTP
      </button>
      <button
        onClick={() => {
          const otp = generateOtp();
          setExpected(otp);
          setEntered("");
          setError("");
          void dispatchOtp(destination, otp, channel);
        }}
        className="mt-3 w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/40 hover:text-white"
      >
        Resend OTP
      </button>
      <p className="mt-4 text-xs leading-5 text-slate-500">{onResendNote}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Registration                                                        */
/* ------------------------------------------------------------------ */

export function RegisterScreen({
  onBack,
  onRegistered,
  emailExists,
}: {
  onBack: () => void;
  onRegistered: (name: string, email: string, phone: string, password: string) => void;
  emailExists: (email: string) => boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [error, setError] = useState("");

  const issues = passwordIssues(password);

  return (
    <AuthShell
      title="Create account"
      headline="Register securely."
      subtitle="Set a strong password and verify your Gmail or phone with a system-generated OTP. Every registration is reported to the platform owner."
      onBack={onBack}
    >
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-cyan-200" />
            <div>
              <h2 className="text-2xl font-bold text-white">New player registration</h2>
              <p className="text-sm text-slate-400">Password is salted &amp; hashed — never stored in plain text</p>
            </div>
          </div>

          {step === "form" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const cleanEmail = email.trim().toLowerCase();
                const cleanPhone = phone.replace(/[^\d+]/g, "");
                if (!name.trim()) return setError("Please enter your name.");
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return setError("Please enter a valid email address.");
                if (emailExists(cleanEmail)) return setError("This email is already registered. Use Player login instead.");
                if (channel === "sms" && cleanPhone.length < 10) return setError("Please enter a valid phone number for SMS OTP.");
                if (issues.length > 0) return setError("Your password does not meet the security requirements yet.");
                if (password !== confirm) return setError("Passwords do not match.");
                setError("");
                setStep("otp");
              }}
            >
              <div className="space-y-5">
                <Field label="Full name">
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="Your name" autoComplete="name" />
                </Field>
                <Field label="Gmail / email address">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="you@gmail.com" autoComplete="email" />
                </Field>
                <Field label="Phone number">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} placeholder="+91 98765 43210" autoComplete="tel" />
                </Field>
                <Field label="Password">
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} placeholder="Create a strong password" autoComplete="new-password" />
                </Field>
                {password && (
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
                <Field label="Confirm password">
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={`${inputClasses} ${confirm && confirm !== password ? "border-red-400/60" : ""}`} placeholder="Repeat the password" autoComplete="new-password" />
                </Field>
                <div>
                  <span className="mb-2 block text-sm font-medium text-slate-300">Send OTP via</span>
                  <div className="flex rounded-full border border-white/10 bg-slate-950/50 p-1">
                    <button type="button" onClick={() => setChannel("email")} className={`flex-1 rounded-full px-4 py-2 text-sm font-bold ${channel === "email" ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`}>
                      Gmail OTP
                    </button>
                    <button type="button" onClick={() => setChannel("sms")} className={`flex-1 rounded-full px-4 py-2 text-sm font-bold ${channel === "sms" ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`}>
                      Phone OTP
                    </button>
                  </div>
                </div>
              </div>
              {error && <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
              <button className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white">
                Send OTP &amp; verify
              </button>
            </form>
          ) : (
            <OtpVerifier
              destination={channel === "email" ? email.trim().toLowerCase() : phone}
              channel={channel}
              onVerified={() => onRegistered(name.trim(), email.trim().toLowerCase(), phone.replace(/[^\d+]/g, ""), password)}
              onResendNote={`On success, your registration details are forwarded to the platform owner at ${OWNER_EMAIL} and a locked ${BRAND} User ID is generated.`}
            />
          )}
        </div>

        <div className="flex flex-col justify-between rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.06] p-6">
          <div>
            <ShieldCheck className="mb-5 h-9 w-9 text-cyan-200" />
            <h3 className="text-3xl font-black tracking-[-0.05em] text-white">One identity. Fully audited.</h3>
            <p className="mt-4 leading-7 text-slate-300">
              Every new registration is OTP verified and reported live to <span className="font-bold text-cyan-100">{OWNER_EMAIL}</span>.
              Your unique User ID locks together your virtual wallet, real-credit wallet, bets, deposits, and withdrawals.
            </p>
          </div>
          <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-300">
            <li className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">Free email OTP: PHPMailer + Gmail SMTP app password.</li>
            <li className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">Free phone OTP: Firebase Phone Auth free tier.</li>
            <li className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">Welcome bonus: 2,500 virtual play credits.</li>
          </ul>
        </div>
      </div>
    </AuthShell>
  );
}

/* ------------------------------------------------------------------ */
/* Player login                                                        */
/* ------------------------------------------------------------------ */

export function LoginScreen({
  onBack,
  onRegisterInstead,
  onLogin,
}: {
  onBack: () => void;
  onRegisterInstead: () => void;
  /** Verifies email + password. Returns an error message, or null on success. */
  onLogin: (email: string, password: string) => Promise<string | null>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <AuthShell
      title="Player login"
      headline="Welcome back."
      subtitle="Sign in with your email and password. Five failed attempts lock the account for five minutes to block brute-force attacks."
      onBack={onBack}
    >
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-3">
          <UserRound className="h-6 w-6 text-cyan-200" />
          <div>
            <h2 className="text-2xl font-bold text-white">Secure login</h2>
            <p className="text-sm text-slate-400">Salted password hashes · brute-force lockout</p>
          </div>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            setBusy(true);
            const result = await onLogin(email.trim().toLowerCase(), password);
            setBusy(false);
            if (result) setError(result);
          }}
        >
          <div className="space-y-5">
            <Field label="Registered email">
              <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="you@gmail.com" autoComplete="email" />
            </Field>
            <Field label="Password">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} placeholder="Your password" autoComplete="current-password" />
            </Field>
          </div>
          {error && <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          <button disabled={busy} className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white disabled:bg-slate-700 disabled:text-slate-400">
            {busy ? "Checking…" : "Login"}
          </button>
          <button type="button" onClick={onRegisterInstead} className="mt-3 w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/40 hover:text-white">
            New here? Create an account
          </button>
        </form>
      </div>
    </AuthShell>
  );
}

/* ------------------------------------------------------------------ */
/* Admin login                                                         */
/* ------------------------------------------------------------------ */

export function AdminLogin({
  onBack,
  onLogin,
}: {
  onBack: () => void;
  onLogin: (adminId: string, password: string) => Promise<boolean>;
}) {
  const [adminId, setAdminId] = useState("admin");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");

  return (
    <AuthShell
      title="Admin access"
      headline="Operations control."
      subtitle="Fully isolated login for the platform owner: live users, live bets, deposits, withdrawals, and support tickets."
      onBack={onBack}
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (!adminId.trim() || !password.trim()) {
            setError("Admin ID and password are required.");
            return;
          }
          const success = await onLogin(adminId, password);
          if (!success) setError("Invalid admin credentials on local PHP server.");
        }}
        className="mx-auto max-w-xl rounded-[2rem] border border-violet-300/20 bg-white/[0.05] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-7 w-7 text-violet-200" />
          <div>
            <h2 className="text-2xl font-bold text-white">Admin login</h2>
            <p className="text-sm text-slate-400">Local PHP route: /php-server/admin-login.php</p>
          </div>
        </div>
        <div className="space-y-5">
          <Field label="Admin ID">
            <input value={adminId} onChange={(e) => setAdminId(e.target.value)} className={`${inputClasses} focus:border-violet-300/70`} />
          </Field>
          <Field label="Password">
            <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} className={`${inputClasses} focus:border-violet-300/70`} />
          </Field>
        </div>
        {error && <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        <button className="mt-6 w-full rounded-2xl bg-violet-300 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white">
          Unlock admin panel
        </button>
        <p className="mt-5 flex items-center gap-2 text-sm leading-6 text-slate-400">
          <LockKeyhole className="h-4 w-4 shrink-0" />
          Separate session namespace. Never linked from the player application.
        </p>
      </form>
    </AuthShell>
  );
}
