export type MarketId = "twii" | "kospi" | "hsi" | "sensex" | "dax" | "dow";
export type MarketState = "open" | "locked" | "settled";
export type BetMode = "double" | "split";
export type SplitSide = "Andar" | "Bahar";
export type BetStatus = "pending" | "won" | "lost" | "refunded";
export type RequestStatus = "pending" | "approved" | "rejected";
export type TicketStatus = "open" | "resolved";

export interface Market {
  id: MarketId;
  name: string;
  symbol: string;
  country: string;
  source: string;
  closeTime: string;
  timezone: string;
  status: MarketState;
  lastPrice: number;
  resultDecimal: string;
  change: number;
  history: string[];
  /** Betting cutoff, minutes since midnight local time. Bets stop at this time. */
  cutoffMinutes: number;
  cutoffLabel: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  wallet: number;
  createdAt: string;
  /** Random per-user salt — passwords are never stored in plain text. */
  salt: string;
  /** SHA-256 hash of salt:password computed with the Web Crypto API. */
  passwordHash: string;
}

export interface Bet {
  id: string;
  userId: string;
  userName: string;
  marketId: MarketId;
  marketName: string;
  mode: BetMode;
  selection: string;
  splitSide?: SplitSide;
  stake: number;
  potentialReturn: number;
  status: BetStatus;
  placedAt: string;
  resultDecimal?: string;
  payout?: number;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  transactionId: string;
  amount: number;
  status: RequestStatus;
  createdAt: string;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  status: RequestStatus;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  topic: string;
  message: string;
  transactionId?: string;
  screenshot?: string;
  screenshotName?: string;
  status: TicketStatus;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: "registration" | "login" | "bet" | "deposit" | "withdraw" | "support";
  title: string;
  detail: string;
  at: string;
}

export const DOUBLE_MULTIPLIER = 90;
export const SPLIT_MULTIPLIER = 9;
export const MIN_DEPOSIT = 100;
export const MIN_WITHDRAW = 500;
export const MAX_DOUBLE_BET = 500;
export const OWNER_EMAIL = "gillparamveer24@gmail.com";
export const API_BASE = "http://localhost:8080";
export const BRAND = "Market 90x";

export const initialMarkets: Market[] = [
  {
    id: "twii",
    name: "Taiwan Index",
    symbol: "^TWII",
    country: "Taiwan",
    source: "https://finance.yahoo.com/quote/%5ETWII/history/",
    closeTime: "11:00 AM",
    timezone: "Local Time",
    status: "open",
    lastPrice: 23688.89,
    resultDecimal: "89",
    change: 0.42,
    history: ["24", "08", "71", "63", "89"],
    cutoffMinutes: 10 * 60 + 53,
    cutoffLabel: "10:53 AM",
  },
  {
    id: "kospi",
    name: "KOSPI",
    symbol: "^KS11",
    country: "South Korea",
    source: "https://finance.yahoo.com/quote/%5EKS11/history/",
    closeTime: "3:30 PM",
    timezone: "KST",
    status: "open",
    lastPrice: 2930.57,
    resultDecimal: "57",
    change: -0.18,
    history: ["91", "06", "44", "18", "57"],
    cutoffMinutes: 11 * 60 + 53,
    cutoffLabel: "11:53 AM",
  },
  {
    id: "hsi",
    name: "Hang Seng",
    symbol: "^HSI",
    country: "Hong Kong",
    source: "https://finance.yahoo.com/quote/%5EHSI/",
    closeTime: "4:00 PM",
    timezone: "HKT",
    status: "open",
    lastPrice: 25742.31,
    resultDecimal: "31",
    change: 0.71,
    history: ["02", "90", "15", "78", "31"],
    cutoffMinutes: 13 * 60 + 32,
    cutoffLabel: "1:32 PM",
  },
  {
    id: "sensex",
    name: "SENSEX",
    symbol: "^BSESN",
    country: "India",
    source: "https://finance.yahoo.com/quote/%5EBSESN/history/",
    closeTime: "3:30 PM",
    timezone: "IST",
    status: "open",
    lastPrice: 84721.44,
    resultDecimal: "44",
    change: 0.34,
    history: ["33", "20", "74", "09", "44"],
    cutoffMinutes: 15 * 60 + 23,
    cutoffLabel: "3:23 PM",
  },
  {
    id: "dax",
    name: "DAX",
    symbol: "^GDAXI",
    country: "Germany",
    source: "https://finance.yahoo.com/quote/%5EGDAXI/history/",
    closeTime: "5:30 PM",
    timezone: "CET",
    status: "open",
    lastPrice: 24318.27,
    resultDecimal: "27",
    change: 0.55,
    history: ["48", "12", "96", "73", "27"],
    cutoffMinutes: 20 * 60 + 55,
    cutoffLabel: "8:55 PM",
  },
  {
    id: "dow",
    name: "Dow Jones",
    symbol: "^DJI",
    country: "United States",
    source: "https://finance.yahoo.com/quote/%5EDJI/history/",
    closeTime: "4:00 PM",
    timezone: "ET",
    status: "open",
    lastPrice: 47412.66,
    resultDecimal: "66",
    change: -0.09,
    history: ["85", "11", "39", "50", "66"],
    cutoffMinutes: 24 * 60,
    cutoffLabel: "12:00 AM",
  },
];

export const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString(36).slice(-5).toUpperCase()}`;

export const createUserId = () =>
  `M90-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(7, "0")}`;

/** Minutes since local midnight for a given date. */
export const minutesOfDay = (date: Date) =>
  date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;

/** Betting is allowed only before the market's cutoff time and while the market is open. */
export const isBettingOpen = (market: Market, now: Date) =>
  market.status === "open" && minutesOfDay(now) < market.cutoffMinutes;

/** Time remaining until the market's betting cutoff, formatted hh:mm:ss. Empty when passed. */
export const timeUntilCutoff = (market: Market, now: Date) => {
  const remainingSeconds = Math.floor(
    (market.cutoffMinutes - minutesOfDay(now)) * 60
  );
  if (remainingSeconds <= 0) return "";
  const h = Math.floor(remainingSeconds / 3600);
  const m = Math.floor((remainingSeconds % 3600) / 60);
  const s = remainingSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// ─── THE FIX ──────────────────────────────────────────────────────────────────
// Before: value.toLocaleString() → crashes when value is undefined/null/NaN
// After:  always coerce to a safe finite number first
export const formatCredits = (value: number | undefined | null): string => {
  // Coerce to number, replace any non-finite result (NaN, Infinity) with 0
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${safeValue.toLocaleString("en-US")} CR`;
};
// ─────────────────────────────────────────────────────────────────────────────

export const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

/* ------------------------------------------------------------------ */
/* Password security (Web Crypto API — no plaintext ever stored)       */
/* ------------------------------------------------------------------ */

export const createSalt = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

export const hashPassword = async (
  password: string,
  salt: string
): Promise<string> => {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

/** Returns a list of unmet password requirements (empty = strong enough). */
export const passwordIssues = (password: string): string[] => {
  const issues: string[] = [];
  if (password.length < 8) issues.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) issues.push("One uppercase letter");
  if (!/[a-z]/.test(password)) issues.push("One lowercase letter");
  if (!/\d/.test(password)) issues.push("One number");
  return issues;
};

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 5;
export const DEFAULT_ADMIN_PASSWORD = "ChangeMe123!";

export const timeAgo = (iso: string) => {
  // Guard against invalid input
  if (!iso) return "just now";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "just now";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleString();
};

export const getMarketStatusClasses = (status: MarketState) => {
  if (status === "open")
    return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
  if (status === "locked")
    return "border-amber-400/40 bg-amber-400/10 text-amber-200";
  return "border-sky-400/40 bg-sky-400/10 text-sky-200";
};

export const getRequestStatusClasses = (
  status: RequestStatus | TicketStatus
) => {
  if (status === "approved" || status === "resolved")
    return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
  if (status === "rejected")
    return "border-red-400/40 bg-red-400/10 text-red-200";
  return "border-amber-400/40 bg-amber-400/10 text-amber-200";
};