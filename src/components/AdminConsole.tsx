// MARKET 90XX - AdminConsole.tsx - 91 Club Mobile UI Reskin
// Game/admin logic is 100% untouched - only UI/UX changed
// Drop-in replacement for src/components/AdminConsole.tsx

import { useMemo, useState, Fragment } from "react";
import type { ReactNode } from "react";
import {
  Banknote,
  Headset,
  KeyRound,
  Landmark,
  ListChecks,
  Radio,
  Users,
} from "lucide-react";

import {
  MAX_DOUBLE_BET,
  MIN_DEPOSIT,
  MIN_WITHDRAW,
  formatCredits,
  getMarketStatusClasses,
  getRequestStatusClasses,
  timeAgo,
} from "@/lib/types";

import type {
  ActivityEvent,
  Bet,
  BetMode,
  DepositRequest,
  Market,
  MarketId,
  SupportTicket,
  UserProfile,
  WithdrawRequest,
} from "@/lib/types";

import { PasswordChangeForm } from "@/components/ui";

// --- Safe helpers - unchanged ---
function safeTimeAgo(date: Date | string | number | undefined | null): string {
  if (!date) return "Just now";
  try {
    if (typeof date === "number") return timeAgo(new Date(date).toISOString());
    if (typeof date === "string") return timeAgo(date);
    return timeAgo((date as Date).toISOString());
  } catch (e) {
    console.warn("Invalid date in timeAgo:", date, e);
    return "Just now";
  }
}
function safeNum(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
function safeCredits(value: unknown): string {
  return formatCredits(safeNum(value));
}

// --- Light UI primitives (match Dashboard.91club.tsx) ---
const card = "bg-white rounded-[18px] border border-slate-200 p-4 shadow-sm";
const h2 = "text-xl font-black text-slate-900";
const sub = "text-sm text-slate-500 mt-1";
const pill = "rounded-full px-3 py-1.5 text-xs font-bold";
const btnRed = "rounded-xl bg-[#e53935] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#c62828] transition disabled:bg-slate-300 disabled:text-slate-500";
const btnGhost = "rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50";
const inputCls = "w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-[15px] outline-none focus:border-[#e53935]";

function StatusBadge({ label, status }: { label: string; status?: string }) {
  const s = (status || label || "").toLowerCase();
  const cls = s.includes("open") || s.includes("approved") || s.includes("won") ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : s.includes("pend") ? "bg-amber-50 text-amber-800 border-amber-200"
    : s.includes("reject") || s.includes("lost") || s.includes("lock") ? "bg-red-50 text-red-700 border-red-200"
    : "bg-slate-100 text-slate-700 border-slate-200";
  return <span className={`${pill} border ${cls}`}>{label}</span>;
}

type AdminTab =
  | "overview"
  | "users"
  | "bets"
  | "deposits"
  | "withdrawals"
  | "support"
  | "settlement"
  | "security";

export function AdminConsole({
  users,
  bets,
  deposits,
  withdrawals,
  tickets,
  events,
  markets,
  onBack,
  onApproveDeposit,
  onRejectDeposit,
  onApproveWithdraw,
  onRejectWithdraw,
  onResolveTicket,
  onSettleMarket,
  onCloseMarket,
  onOpenMarket,
  onRejectBet,
  onChangePassword,
}: {
  users: UserProfile[];
  bets: Bet[];
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  tickets: SupportTicket[];
  events: ActivityEvent[];
  markets: Market[];
  onBack: () => void;
  onApproveDeposit: (id: string) => void;
  onRejectDeposit: (id: string) => void;
  onApproveWithdraw: (id: string) => void;
  onRejectWithdraw: (id: string) => void;
  onResolveTicket: (id: string) => void;
  onSettleMarket: (marketId: MarketId, resultDecimal: string) => void;
  onCloseMarket: (marketId: MarketId) => void;
  onOpenMarket: (marketId: MarketId) => void;
  onRejectBet: (betId: string) => void;
  onChangePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<string | null>;
}) {
  const [tab, setTab] = useState<AdminTab>("overview");

  // Safety: ensure arrays are always arrays
  const safeUsers = useMemo(() => (Array.isArray(users) ? users.filter(Boolean) : []), [users]);
  const safeBets = useMemo(() => (Array.isArray(bets) ? bets.filter(Boolean) : []), [bets]);
  const safeDeposits = useMemo(() => (Array.isArray(deposits) ? deposits.filter(Boolean) : []), [deposits]);
  const safeWithdrawals = useMemo(() => (Array.isArray(withdrawals) ? withdrawals.filter(Boolean) : []), [withdrawals]);
  const safeTickets = useMemo(() => (Array.isArray(tickets) ? tickets.filter(Boolean) : []), [tickets]);
  const safeEvents = useMemo(() => (Array.isArray(events) ? events.filter(Boolean) : []), [events]);
  const safeMarkets = useMemo(() => (Array.isArray(markets) ? markets.filter(Boolean) : []), [markets]);

  const pendingDeposits = safeDeposits.filter((d) => d?.status === "pending");
  const pendingWithdrawals = safeWithdrawals.filter((w) => w?.status === "pending");
  const openTickets = safeTickets.filter((t) => t?.status === "open");

  const tabs: { id: AdminTab; label: string; badge?: number }[] = [
    { id: "overview", label: "Live Feed" },
    { id: "users", label: "Users" },
    { id: "bets", label: "Bets", badge: safeBets.filter((b) => b?.status === "pending").length },
    { id: "deposits", label: "Deposits", badge: pendingDeposits.length },
    { id: "withdrawals", label: "Withdraws", badge: pendingWithdrawals.length },
    { id: "support", label: "Support", badge: openTickets.length },
    { id: "settlement", label: "Settlement" },
    { id: "security", label: "Security" },
  ];

  return (
    <div className="min-h-screen bg-[#e8e8e8] text-slate-900 flex justify-center">
      <div className="w-full max-w-[980px] bg-[#f5f5f7] min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-[#e53935] font-bold">Admin · live</div>
              <h1 className="text-[22px] font-black text-slate-900">Operations control</h1>
              <p className="text-xs text-slate-500">MARKET 90XX admin console</p>
            </div>
            <button onClick={onBack} className={btnGhost + " !py-2 !px-3 text-xs"}>Exit</button>
          </div>

          {/* Tab bar - horizontally scrollable */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition border ${
                  tab === item.id
                    ? "bg-[#e53935] text-white border-[#e53935]"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {item.label}
                {item.badge ? (
                  <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-black ${
                    tab === item.id ? "bg-white/20 text-white" : "bg-[#e53935] text-white"
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </header>

        {/* Tab panels */}
        <div className="px-3.5 py-3.5 pb-8">
          {tab === "overview" && (
            <OverviewTab
              users={safeUsers}
              bets={safeBets}
              deposits={pendingDeposits}
              withdrawals={pendingWithdrawals}
              tickets={openTickets}
              events={safeEvents}
              markets={safeMarkets}
            />
          )}
          {tab === "users" && <UsersTab users={safeUsers} events={safeEvents} />}
          {tab === "bets" && <BetsTab bets={safeBets} onRejectBet={onRejectBet} />}
          {tab === "deposits" && (
            <DepositsTab deposits={safeDeposits} onApprove={onApproveDeposit} onReject={onRejectDeposit} />
          )}
          {tab === "withdrawals" && (
            <WithdrawalsTab
              withdrawals={safeWithdrawals}
              onApprove={onApproveWithdraw}
              onReject={onRejectWithdraw}
            />
          )}
          {tab === "support" && <SupportTab tickets={safeTickets} onResolve={onResolveTicket} />}
          {tab === "settlement" && (
            <SettlementTab
              bets={safeBets}
              markets={safeMarkets}
              onSettleMarket={onSettleMarket}
              onCloseMarket={onCloseMarket}
              onOpenMarket={onOpenMarket}
            />
          )}
          {tab === "security" && <SecurityTab onChangePassword={onChangePassword} />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SecurityTab                                                        */
/* ------------------------------------------------------------------ */

function SecurityTab({
  onChangePassword,
}: {
  onChangePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<string | null>;
}) {
  return (
    <div className="space-y-3">
      <div className={card}>
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <KeyRound className="h-5 w-5 text-[#e53935]" /> Change admin password
        </div>
        <p className={sub}>Password is stored only as a salted hash. Synced to the local PHP server when running.</p>
        <div className="mt-4">
          <PasswordChangeForm accent="cyan" onChangePassword={onChangePassword} />
        </div>
      </div>
      <div className={card}>
        <h3 className="font-bold text-slate-900">Account protection</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li className="bg-slate-50 border border-slate-200 rounded-xl p-3">Passwords hashed with per-account random salts (SHA-256)</li>
          <li className="bg-slate-50 border border-slate-200 rounded-xl p-3">Brute-force lockout: 5 failed logins = 5 min lock</li>
          <li className="bg-slate-50 border border-slate-200 rounded-xl p-3">Registration requires OTP verification</li>
          <li className="bg-slate-50 border border-slate-200 rounded-xl p-3">Admin session is fully isolated from player app</li>
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* OverviewTab                                                        */
/* ------------------------------------------------------------------ */

function OverviewTab({
  users,
  bets,
  deposits,
  withdrawals,
  tickets,
  events,
  markets,
}: {
  users: UserProfile[];
  bets: Bet[];
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  tickets: SupportTicket[];
  events: ActivityEvent[];
  markets: Market[];
}) {
  const marketSummaries = useMemo(
    () =>
      markets
        .filter((m) => m && m.id)
        .map((market) => {
          const pendingBets = bets.filter(
            (bet) => bet && bet.marketId === market.id && bet.status === "pending"
          );
          return {
            id: market.id,
            name: market.name || "Unknown",
            status: market.status || "settled",
            pendingCount: pendingBets.length,
            pendingStake: pendingBets.reduce((sum, bet) => sum + safeNum(bet?.stake), 0),
          };
        })
        .sort((a, b) => b.pendingStake - a.pendingStake),
    [markets, bets]
  );

  const openMarkets = markets.filter((m) => m?.status === "open").length;
  const totalWalletBalance = users.reduce((sum, u) => sum + safeNum(u?.wallet), 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        <div className={card + " !p-3"}><div className="text-xs text-slate-500">Users</div><div className="text-2xl font-black">{users?.length || 0}</div></div>
        <div className={card + " !p-3"}><div className="text-xs text-slate-500">Total bets</div><div className="text-2xl font-black">{bets?.length || 0}</div></div>
        <div className={card + " !p-3"}><div className="text-xs text-slate-500">Pending deposits</div><div className="text-2xl font-black">{deposits?.length || 0}</div></div>
        <div className={card + " !p-3"}><div className="text-xs text-slate-500">Pending withdraws</div><div className="text-2xl font-black">{withdrawals?.length || 0}</div></div>
        <div className={card + " !p-3"}><div className="text-xs text-slate-500">Open tickets</div><div className="text-2xl font-black">{tickets?.length || 0}</div></div>
        <div className={card + " !p-3"}><div className="text-xs text-slate-500">Wallet total</div><div className="text-xl font-black">{safeCredits(totalWalletBalance)}</div></div>
      </div>

      <div className={card}>
        <div className="font-bold text-slate-900">Market exposure</div>
        <p className={sub}>Open markets: {openMarkets}</p>
        <div className="mt-3 space-y-2 max-h-[320px] overflow-y-auto">
          {marketSummaries.length === 0 && <p className="text-sm text-slate-500">No markets.</p>}
          {marketSummaries.map((s) => (
            <div key={s.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
              <div><b>{s.name}</b> · <StatusBadge label={s.status} status={s.status} /></div>
              <div className="text-right"><div className="font-mono font-bold">{safeCredits(s.pendingStake)}</div><div className="text-xs text-slate-500">{s.pendingCount} bets</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center gap-2 font-bold text-slate-900"><Radio className="h-4 w-4 text-[#e53935]" /> Live activity feed</div>
        <div className="mt-3 space-y-2 max-h-[380px] overflow-y-auto">
          {events?.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet.</p>
          ) : (
            events?.map((event) => {
              if (!event || !event.id) return null;
              return (
                <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-900 text-sm">{event?.title || "Unknown Event"}</p>
                    <span className="text-xs text-slate-500 shrink-0">{safeTimeAgo(event?.at)}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{event?.detail || "No details"}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* UsersTab                                                           */
/* ------------------------------------------------------------------ */

function UsersTab({
  users,
  events,
}: {
  users: UserProfile[];
  events: ActivityEvent[];
}) {
  const authEvents = events.filter(
    (event) => event?.type === "registration" || event?.type === "login"
  );

  return (
    <div className="space-y-3">
      <div className={card}>
        <div className="font-bold text-slate-900 flex items-center gap-2"><Users className="h-4 w-4 text-[#e53935]" /> Registered accounts · {users.length}</div>
        <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-sm text-slate-500">No users yet.</p>
          ) : (
            users.map((user) => {
              if (!user || !user.userId) return null;
              return (
                <div key={user.userId} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
                  <div className="font-mono font-bold text-[#e53935]">{user.userId}</div>
                  <div className="font-semibold">{user.name || "Unknown"} · {user.phone || "—"}</div>
                  <div className="text-slate-600">Balance: {safeCredits(user?.wallet)} · Joined {safeTimeAgo(user?.createdAt)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={card}>
        <h2 className="font-bold text-slate-900">Login & registration stream</h2>
        <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto">
          {authEvents.length === 0 ? (
            <p className="text-sm text-slate-500">No login activity yet.</p>
          ) : (
            authEvents.map((event) => {
              if (!event || !event.id) return null;
              return (
                <div key={event.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
                  <div className="font-bold">{event.title || "Unknown"}</div>
                  <div className="text-slate-600">{event.detail || "No details"}</div>
                  <div className="text-xs text-slate-500">{safeTimeAgo(event?.at)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BetsTab                                                            */
/* ------------------------------------------------------------------ */

function BetsTab({
  bets,
  onRejectBet,
}: {
  bets: Bet[];
  onRejectBet: (betId: string) => void;
}) {
  const validBets = useMemo(
    () => bets.filter((bet) => bet && bet.id && bet.marketId && bet.userId),
    [bets]
  );
  const pendingBets = validBets.filter((bet) => bet?.status === "pending");
  const totalStakePlaced = useMemo(
    () => validBets.reduce((sum, bet) => sum + safeNum(bet?.stake), 0),
    [validBets]
  );
  const totalPendingStake = useMemo(
    () => pendingBets.reduce((sum, bet) => sum + safeNum(bet?.stake), 0),
    [pendingBets]
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2.5">
        <div className={card + " !p-3"}><div className="text-xs text-slate-500">Total bets</div><div className="text-xl font-black">{validBets.length}</div></div>
        <div className={card + " !p-3"}><div className="text-xs text-slate-500">Total stake</div><div className="text-xl font-black">{safeCredits(totalStakePlaced)}</div></div>
        <div className={card + " !p-3"}><div className="text-xs text-slate-500">Pending</div><div className="text-xl font-black">{safeCredits(totalPendingStake)}</div></div>
      </div>

      <div className={card}>
        <h3 className="font-bold text-slate-900">Pending bets · {pendingBets.length}</h3>
        <div className="mt-3 space-y-2 max-h-[600px] overflow-y-auto">
          {pendingBets.length === 0 ? (
            <p className="text-sm text-slate-500">No pending bets.</p>
          ) : (
            pendingBets.map((bet) => {
              if (!bet || !bet.id) return null;
              return (
                <div key={bet.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
                  <div className="font-bold">{bet.marketName || "Unknown"} · {bet.mode === "double" ? "Double" : bet.splitSide || "Split"} {bet.selection || "?"}</div>
                  <div className="text-slate-600">{bet.userName || "Unknown"} · {bet.userId} · stake {safeCredits(bet.stake)} · potential {safeCredits(bet.potentialReturn)}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{safeTimeAgo(bet.placedAt)}</span>
                    <button onClick={() => onRejectBet(bet.id)} className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600">Reject & refund</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={card}>
        <h3 className="font-bold text-slate-900">All bets</h3>
        <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto text-sm">
          {validBets.slice(0, 50).map(bet => (
            <div key={bet.id} className="flex justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <span>{bet.marketName} · {bet.selection} · {bet.userName}</span>
              <span className="font-mono">{safeCredits(bet.stake)} · {bet.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DepositsTab / WithdrawalsTab                                       */
/* ------------------------------------------------------------------ */

function DepositsTab({
  deposits,
  onApprove,
  onReject,
}: {
  deposits: DepositRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className={card}>
      <div className="font-bold text-slate-900 flex items-center gap-2"><Banknote className="h-4 w-4 text-[#e53935]" /> QR deposit verification</div>
      <p className={sub}>Approve only after matching User ID, transaction ID, and amount.</p>
      <div className="mt-3 space-y-2.5">
        {deposits.length === 0 ? (
          <p className="text-sm text-slate-500">No deposit requests.</p>
        ) : (
          deposits.map((d) => {
            if (!d || !d.id) return null;
            return (
              <RequestCard
                key={d.id}
                status={d.status || "pending"}
                meta={[
                  { label: "User", value: `${d.userName || "Unknown"} · ${d.userId || "N/A"}` },
                  { label: "TX ID", value: d.transactionId || "N/A" },
                  { label: "Amount", value: safeCredits(d?.amount) },
                  { label: "Submitted", value: safeTimeAgo(d?.createdAt) },
                ]}
                onApprove={d.status === "pending" ? () => onApprove(d.id) : undefined}
                onReject={d.status === "pending" ? () => onReject(d.id) : undefined}
                approveLabel="Approve & credit"
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function WithdrawalsTab({
  withdrawals,
  onApprove,
  onReject,
}: {
  withdrawals: WithdrawRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className={card}>
      <div className="font-bold text-slate-900 flex items-center gap-2"><Landmark className="h-4 w-4 text-[#e53935]" /> Withdrawal verification</div>
      <p className={sub}>Amount is already held. Approve to payout, reject to refund.</p>
      <div className="mt-3 space-y-2.5">
        {withdrawals.length === 0 ? (
          <p className="text-sm text-slate-500">No withdrawal requests.</p>
        ) : (
          withdrawals.map((w) => {
            if (!w || !w.id) return null;
            return (
              <RequestCard
                key={w.id}
                status={w.status || "pending"}
                meta={[
                  { label: "User", value: `${w.userName || "Unknown"} · ${w.userId || "N/A"}` },
                  { label: "Amount", value: safeCredits(w?.amount) },
                  { label: "Bank", value: `${w.bankName || "N/A"} · ${w.accountHolder || "N/A"}` },
                  { label: "Account", value: `${w.accountNumber || "N/A"} · ${w.ifsc || "N/A"}` },
                  { label: "Submitted", value: safeTimeAgo(w?.createdAt) },
                ]}
                onApprove={w.status === "pending" ? () => onApprove(w.id) : undefined}
                onReject={w.status === "pending" ? () => onReject(w.id) : undefined}
                approveLabel="Initiate payout"
              />
            );
          })
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SupportTab                                                         */
/* ------------------------------------------------------------------ */

function SupportTab({
  tickets,
  onResolve,
}: {
  tickets: SupportTicket[];
  onResolve: (id: string) => void;
}) {
  return (
    <div className={card}>
      <div className="font-bold text-slate-900 flex items-center gap-2"><Headset className="h-4 w-4 text-[#e53935]" /> Agent tickets</div>
      <div className="mt-3 space-y-3">
        {tickets.length === 0 ? (
          <p className="text-sm text-slate-500">No support tickets.</p>
        ) : (
          tickets.map((t) => {
            if (!t || !t.id) return null;
            return (
              <div key={t.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{t.topic || "Unknown"}</p>
                  <StatusBadge label={t.status || "open"} status={t.status} />
                </div>
                <p className="text-slate-600 mt-1">{t.userName || "Unknown"} · {t.userId || "N/A"}</p>
                <p className="mt-1">{t.message || "No message"}</p>
                {t.transactionId && <p className="font-mono text-[#e53935] text-xs mt-1">TX: {t.transactionId}</p>}
                {t.screenshot && (
                  <img src={t.screenshot} alt={`Payment screenshot from ${t.userId || "user"}`} className="mt-2 max-h-48 rounded-lg border border-slate-200 object-contain bg-white" />
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{safeTimeAgo(t?.createdAt)}</span>
                  {t.status === "open" && (
                    <button onClick={() => onResolve(t.id)} className={btnRed + " !py-1.5 !px-3 !text-xs"}>
                      Mark resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SettlementTab                                                      */
/* ------------------------------------------------------------------ */

function SettlementTab({
  bets,
  markets,
  onSettleMarket,
  onCloseMarket,
  onOpenMarket,
}: {
  bets: Bet[];
  markets: Market[];
  onSettleMarket: (marketId: MarketId, resultDecimal: string) => void;
  onCloseMarket: (marketId: MarketId) => void;
  onOpenMarket: (marketId: MarketId) => void;
}) {
  const [selectedMarket, setSelectedMarket] = useState<MarketId>(
    markets[0]?.id ?? "hsi"
  );
  const [resultDigits, setResultDigits] = useState("31");

  const activeMarket = markets.find((market) => market?.id === selectedMarket);

  const marketSummaries = useMemo(
    () =>
      markets
        .filter((m) => m && m.id)
        .map((market) => {
          const marketBets = bets.filter(
            (bet) => bet && bet.marketId === market.id
          );
          const pendingBetCount = marketBets.filter(
            (bet) => bet?.status === "pending"
          ).length;
          const totalStake = marketBets.reduce(
            (sum, bet) => sum + safeNum(bet?.stake),
            0
          );
          return {
            id: market.id,
            name: market.name || "Unknown",
            status: market.status || "settled",
            result: market.resultDecimal ?? "--",
            totalBets: marketBets.length,
            pendingBetCount,
            totalStake,
          };
        }),
    [bets, markets]
  );

  return (
    <div className="space-y-3">
      <div className={card}>
        <h2 className="text-xl font-black text-slate-900">Declare market result</h2>
        <p className={sub}>Settles every pending bet instantly.</p>
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="text-xs text-slate-500">Market</span>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value as MarketId)}
              className={inputCls}
            >
              {markets.map((market) => {
                if (!market || !market.id) return null;
                return (
                  <option key={market.id} value={market.id}>
                    {market.name || "Unknown"} {market.symbol || ""}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="block">
            <span className="text-xs text-slate-500">Final decimal digits</span>
            <input
              value={resultDigits}
              maxLength={2}
              onChange={(e) =>
                setResultDigits(e.target.value.replace(/\D/g, "").slice(0, 2))
              }
              className={inputCls + " font-mono text-2xl font-black"}
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSettleMarket(selectedMarket, resultDigits || "00")}
              className={btnRed}
            >
              Settle now
            </button>
            <button
              onClick={() =>
                activeMarket?.status === "open"
                  ? onCloseMarket(selectedMarket)
                  : onOpenMarket(selectedMarket)
              }
              className={activeMarket?.status === "open"
                ? "rounded-xl bg-slate-800 text-white px-4 py-2.5 text-sm font-bold"
                : "rounded-xl bg-emerald-500 text-white px-4 py-2.5 text-sm font-bold"
              }
            >
              {activeMarket?.status === "open" ? "Close market" : "Open market"}
            </button>
          </div>
          <p className="text-xs text-slate-500">Close locks betting immediately; pending stakes are refunded.</p>
        </div>
      </div>

      <div className={card}>
        <h3 className="font-bold text-slate-900">Market totals</h3>
        <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto">
          {marketSummaries.map((s) => (
            <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm flex items-center justify-between">
              <div>
                <div className="font-bold">{s.name} · <StatusBadge label={s.status} status={s.status} /></div>
                <div className="text-slate-600">{s.totalBets} bets · {s.pendingBetCount} pending · result {s.result}</div>
              </div>
              <div className="font-mono font-bold text-right">{safeCredits(s.totalStake)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={card}>
        <h3 className="font-bold text-slate-900">Integrity checklist</h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-600">
          <li className="bg-slate-50 border border-slate-200 rounded-xl p-3">Double-digit winners pay 90× (max {MAX_DOUBLE_BET} per number); Andar/Bahar 9×</li>
          <li className="bg-slate-50 border border-slate-200 rounded-xl p-3">Min deposit {MIN_DEPOSIT} · Min withdraw {MIN_WITHDRAW}</li>
          <li className="bg-slate-50 border border-slate-200 rounded-xl p-3">Duplicate TX IDs rejected</li>
          <li className="bg-slate-50 border border-slate-200 rounded-xl p-3">Withdrawal amounts held immediately; refund on reject</li>
          <li className="bg-slate-50 border border-slate-200 rounded-xl p-3">Market lock refunds all pending bets</li>
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RequestCard                                                        */
/* ------------------------------------------------------------------ */

function RequestCard({
  status,
  meta,
  onApprove,
  onReject,
  approveLabel,
}: {
  status: "pending" | "approved" | "rejected";
  meta: { label: string; value: string }[];
  onApprove?: () => void;
  onReject?: () => void;
  approveLabel: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {meta.map((item) => (
          <div key={item.label} className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">{item.label}</p>
            <p className="truncate font-mono text-sm font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <StatusBadge label={status} status={status} />
        {onApprove && onReject && (
          <div className="flex gap-2">
            <button onClick={onReject} className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Reject</button>
            <button onClick={onApprove} className="rounded-full bg-[#e53935] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#c62828]">{approveLabel}</button>
          </div>
        )}
      </div>
    </div>
  );
}
