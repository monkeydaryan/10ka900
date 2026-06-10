import { useState } from "react";
import type { ReactNode } from "react";
import { Banknote, Headset, KeyRound, Landmark, ListChecks, Radio, Users } from "lucide-react";
import {
  MAX_DOUBLE_BET,
  MIN_DEPOSIT,
  MIN_WITHDRAW,
  OWNER_EMAIL,
  formatCredits,
  getRequestStatusClasses,
  timeAgo,
} from "@/lib/types";
import type {
  ActivityEvent,
  Bet,
  DepositRequest,
  Market,
  MarketId,
  SupportTicket,
  UserProfile,
  WithdrawRequest,
} from "@/lib/types";
import { InfoStrip, LiveDot, PasswordChangeForm, SectionCard, StatusBadge, inputClasses } from "@/components/ui";
import { BetRow } from "@/components/Dashboard";

type AdminTab = "overview" | "users" | "bets" | "deposits" | "withdrawals" | "support" | "settlement" | "security";

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
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
}) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const pendingDeposits = deposits.filter((d) => d.status === "pending");
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const openTickets = tickets.filter((t) => t.status === "open");

  const tabs: { id: AdminTab; label: string; badge?: number }[] = [
    { id: "overview", label: "Live Feed" },
    { id: "users", label: "Users & Logins" },
    { id: "bets", label: "Live Bets", badge: bets.filter((b) => b.status === "pending").length },
    { id: "deposits", label: "Deposits", badge: pendingDeposits.length },
    { id: "withdrawals", label: "Withdrawals", badge: pendingWithdrawals.length },
    { id: "support", label: "Support", badge: openTickets.length },
    { id: "settlement", label: "Settlement" },
    { id: "security", label: "Security" },
  ];

  return (
    <main className="min-h-screen bg-[#070511] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="grid-bg fixed inset-0 opacity-40" />
      <div className="relative mx-auto max-w-[1450px]">
        <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <LiveDot />
              <p className="text-xs uppercase tracking-[0.5em] text-violet-200/80">Isolated admin · live</p>
            </div>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.08em] sm:text-5xl">Operations control room</h1>
            <p className="mt-2 text-sm text-slate-400">Registration alerts are forwarded to the platform operations team.</p>
          </div>
          <button onClick={onBack} className="w-fit rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/40 hover:text-white">
            Exit admin
          </button>
        </header>

        <div className="mb-5 flex gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === item.id ? "bg-violet-300 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
            >
              {item.label}
              {item.badge ? (
                <span className={`rounded-full px-2 py-0.5 text-xs font-black ${tab === item.id ? "bg-slate-950 text-violet-200" : "bg-violet-300 text-slate-950"}`}>{item.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab users={users} bets={bets} deposits={pendingDeposits} withdrawals={pendingWithdrawals} tickets={openTickets} events={events} />}
        {tab === "users" && <UsersTab users={users} events={events} />}
        {tab === "bets" && <BetsTab bets={bets} />}
        {tab === "deposits" && <DepositsTab deposits={deposits} onApprove={onApproveDeposit} onReject={onRejectDeposit} />}
        {tab === "withdrawals" && <WithdrawalsTab withdrawals={withdrawals} onApprove={onApproveWithdraw} onReject={onRejectWithdraw} />}
        {tab === "support" && <SupportTab tickets={tickets} onResolve={onResolveTicket} />}
        {tab === "settlement" && <SettlementTab markets={markets} onSettleMarket={onSettleMarket} />}
        {tab === "security" && <SecurityTab onChangePassword={onChangePassword} />}
      </div>
    </main>
  );
}

function SecurityTab({ onChangePassword }: { onChangePassword: (currentPassword: string, newPassword: string) => Promise<string | null> }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionCard>
        <div className="flex items-center gap-3">
          <KeyRound className="h-7 w-7 text-violet-200" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-violet-200/80">Admin security</p>
            <h2 className="text-3xl font-black tracking-[-0.06em]">Change admin password</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The initial admin password is set by the server. Rotate it here — the new password is stored only as a salted hash, and the change is synced to the local PHP server when it is running.
        </p>
        <div className="mt-6">
          <PasswordChangeForm accent="violet" onChangePassword={onChangePassword} />
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="text-xl font-bold">Account protection in force</h3>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
          <li className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">Passwords hashed with per-account random salts (SHA-256, Web Crypto) — never stored or transmitted in plain text in this UI.</li>
          <li className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">Brute-force lockout: 5 failed logins lock the account (user or admin) for 5 minutes.</li>
          <li className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">Registration requires OTP verification of phone before an account is created.</li>
          <li className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">Admin session namespace is fully isolated from the player application.</li>
          <li className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">Production upgrade path: PHP <code className="text-violet-200">password_hash()</code> (bcrypt) server-side, HTTPS-only cookies, CSRF tokens, and rate limiting at the web server.</li>
        </ul>
      </SectionCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function OverviewTab({
  users,
  bets,
  deposits,
  withdrawals,
  tickets,
  events,
}: {
  users: UserProfile[];
  bets: Bet[];
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  tickets: SupportTicket[];
  events: ActivityEvent[];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoStrip label="Registered users" value={String(users.length)} />
        <InfoStrip label="Total bets placed" value={String(bets.length)} />
        <InfoStrip label="Pending deposits" value={String(deposits.length)} />
        <InfoStrip label="Pending withdrawals" value={String(withdrawals.length)} />
        <InfoStrip label="Open support tickets" value={String(tickets.length)} />
        <InfoStrip label="Total balance in wallets" value={formatCredits(users.reduce((sum, u) => sum + u.realWallet, 0))} />
      </div>

      <SectionCard>
        <div className="flex items-center gap-3">
          <Radio className="h-5 w-5 text-violet-200" />
          <h2 className="text-xl font-bold">Live activity feed</h2>
          <LiveDot />
        </div>
        <div className="mt-4 max-h-[34rem] space-y-3 overflow-y-auto pr-1">
          {events.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No activity yet. Events appear here in real time.</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-white">{event.title}</p>
                  <span className="shrink-0 text-xs text-slate-500">{timeAgo(event.at)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{event.detail}</p>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function UsersTab({ users, events }: { users: UserProfile[]; events: ActivityEvent[] }) {
  const authEvents = events.filter((event) => event.type === "registration" || event.type === "login");
  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <SectionCard>
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-violet-200" />
          <h2 className="text-xl font-bold">All registered accounts</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="py-3 pr-4">User ID</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Demo wallet</th>
                <th className="py-3 pr-4">My balance</th>
                <th className="py-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-mono text-cyan-100">{user.userId}</td>
                  <td className="py-3 pr-4 font-semibold text-white">{user.name}</td>
                  <td className="py-3 pr-4 text-slate-300">
                    {user.phone || "—"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-slate-300">{formatCredits(user.wallet)}</td>
                  <td className="py-3 pr-4 font-mono text-emerald-200">{formatCredits(user.realWallet)}</td>
                  <td className="py-3 text-slate-400">{timeAgo(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No users registered yet.</p>}
        </div>
      </SectionCard>

      <SectionCard>
        <h2 className="text-xl font-bold">Login &amp; registration stream</h2>
        <p className="mt-1 text-sm text-slate-400">Each event is also forwarded to the platform operations team.</p>
        <div className="mt-4 max-h-[30rem] space-y-3 overflow-y-auto pr-1">
          {authEvents.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No login activity yet.</p>
          ) : (
            authEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-white">{event.title}</p>
                  <span className="shrink-0 text-xs text-slate-500">{timeAgo(event.at)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{event.detail}</p>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function BetsTab({ bets }: { bets: Bet[] }) {
  return (
    <SectionCard>
      <div className="flex items-center gap-3">
        <ListChecks className="h-5 w-5 text-violet-200" />
        <h2 className="text-xl font-bold">Every bet, live</h2>
        <LiveDot />
      </div>
      <div className="mt-4 space-y-3">
        {bets.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No bets placed yet.</p>
        ) : (
          bets.map((bet) => <BetRow key={bet.id} bet={bet} showUser />)
        )}
      </div>
    </SectionCard>
  );
}

function DepositsTab({ deposits, onApprove, onReject }: { deposits: DepositRequest[]; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  return (
    <SectionCard>
      <div className="flex items-center gap-3">
        <Banknote className="h-5 w-5 text-violet-200" />
        <h2 className="text-xl font-bold">QR deposit verification</h2>
      </div>
      <p className="mt-1 text-sm text-slate-400">Approve only after matching the unique User ID, transaction ID, and amount in your payment app.</p>
      <div className="mt-4 space-y-3">
        {deposits.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No deposit requests yet.</p>
        ) : (
          deposits.map((deposit) => (
            <RequestCard
              key={deposit.id}
              status={deposit.status}
              meta={[
                { label: "User", value: `${deposit.userName} · ${deposit.userId}` },
                { label: "Transaction ID", value: deposit.transactionId },
                { label: "Amount", value: formatCredits(deposit.amount) },
                { label: "Submitted", value: timeAgo(deposit.createdAt) },
              ]}
              onApprove={deposit.status === "pending" ? () => onApprove(deposit.id) : undefined}
              onReject={deposit.status === "pending" ? () => onReject(deposit.id) : undefined}
              approveLabel="Approve & credit real wallet"
            />
          ))
        )}
      </div>
    </SectionCard>
  );
}

function WithdrawalsTab({ withdrawals, onApprove, onReject }: { withdrawals: WithdrawRequest[]; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  return (
    <SectionCard>
      <div className="flex items-center gap-3">
        <Landmark className="h-5 w-5 text-violet-200" />
        <h2 className="text-xl font-bold">Withdrawal verification</h2>
      </div>
      <p className="mt-1 text-sm text-slate-400">The amount is already on hold from the user's real-credit balance. Approve to initiate the bank payout, or reject to refund the hold.</p>
      <div className="mt-4 space-y-3">
        {withdrawals.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No withdrawal requests yet.</p>
        ) : (
          withdrawals.map((withdrawal) => (
            <RequestCard
              key={withdrawal.id}
              status={withdrawal.status}
              meta={[
                { label: "User", value: `${withdrawal.userName} · ${withdrawal.userId}` },
                { label: "Amount", value: formatCredits(withdrawal.amount) },
                { label: "Bank", value: `${withdrawal.bankName} · ${withdrawal.accountHolder}` },
                { label: "Account", value: `${withdrawal.accountNumber} · ${withdrawal.ifsc}` },
                { label: "Submitted", value: timeAgo(withdrawal.createdAt) },
              ]}
              onApprove={withdrawal.status === "pending" ? () => onApprove(withdrawal.id) : undefined}
              onReject={withdrawal.status === "pending" ? () => onReject(withdrawal.id) : undefined}
              approveLabel="Initiate payout"
            />
          ))
        )}
      </div>
    </SectionCard>
  );
}

function SupportTab({ tickets, onResolve }: { tickets: SupportTicket[]; onResolve: (id: string) => void }) {
  return (
    <SectionCard>
      <div className="flex items-center gap-3">
        <Headset className="h-5 w-5 text-violet-200" />
        <h2 className="text-xl font-bold">Agent tickets — deposit issues</h2>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {tickets.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No support tickets yet.</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-white">{ticket.topic}</p>
                <StatusBadge label={ticket.status} classes={getRequestStatusClasses(ticket.status)} />
              </div>
              <p className="mt-1 font-mono text-xs text-cyan-200">{ticket.userName} · {ticket.userId}</p>
              <p className="mt-2 text-sm text-slate-300">{ticket.message}</p>
              {ticket.transactionId && <p className="mt-2 font-mono text-sm text-cyan-100">TX: {ticket.transactionId}</p>}
              {ticket.screenshot && (
                <img src={ticket.screenshot} alt={`Payment screenshot from ${ticket.userId}`} className="mt-3 max-h-56 rounded-xl border border-white/10 object-contain" />
              )}
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">{timeAgo(ticket.createdAt)}</span>
                {ticket.status === "open" && (
                  <button onClick={() => onResolve(ticket.id)} className="rounded-full bg-violet-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-white">
                    Mark verified &amp; resolved
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function SettlementTab({ markets, onSettleMarket }: { markets: Market[]; onSettleMarket: (marketId: MarketId, resultDecimal: string) => void }) {
  const [selectedMarket, setSelectedMarket] = useState<MarketId>("hsi");
  const [resultDigits, setResultDigits] = useState("31");

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionCard>
        <h2 className="text-2xl font-black">Declare market result</h2>
        <p className="mt-2 text-sm text-slate-400">Simulates the scheduled Yahoo close capture job: extracts the final two decimal digits and settles every pending bet instantly.</p>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Market</span>
            <select value={selectedMarket} onChange={(event) => setSelectedMarket(event.target.value as MarketId)} className={`${inputClasses} focus:border-violet-300/60`}>
              {markets.map((market) => (
                <option key={market.id} value={market.id}>
                  {market.name} {market.symbol}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Final decimal digits</span>
            <input
              value={resultDigits}
              maxLength={2}
              onChange={(event) => setResultDigits(event.target.value.replace(/\D/g, "").slice(0, 2))}
              className={`${inputClasses} font-mono text-3xl font-black text-cyan-100 focus:border-violet-300/60`}
            />
          </label>
          <button onClick={() => onSettleMarket(selectedMarket, resultDigits || "00")} className="w-full rounded-2xl bg-violet-300 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white">
            Settle bets now
          </button>
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="text-xl font-bold">Integrity checklist</h3>
        <ChecklistItem>Double-digit winners pay 90x (max {MAX_DOUBLE_BET} stake per number); Andar/Bahar pays 9x — settled atomically per market.</ChecklistItem>
        <ChecklistItem>Deposits below {MIN_DEPOSIT} credits and withdrawals below {MIN_WITHDRAW} credits are rejected client- and server-side.</ChecklistItem>
        <ChecklistItem>Betting cutoffs: Taiwan 10:53 AM · KOSPI 11:53 AM · Hang Seng 1:32 PM · SENSEX 3:23 PM · DAX 8:55 PM · Dow Jones 12:00 AM.</ChecklistItem>
        <ChecklistItem>Duplicate transaction IDs cannot be submitted twice.</ChecklistItem>
        <ChecklistItem>Withdrawal amounts are held immediately to prevent double spending; rejects refund instantly.</ChecklistItem>
        <ChecklistItem>Registrations and logins are OTP verified and reported to platform operations.</ChecklistItem>
        <ChecklistItem>Admin session is fully isolated from the player application.</ChecklistItem>
      </SectionCard>
    </div>
  );
}

function ChecklistItem({ children }: { children: ReactNode }) {
  return <p className="mt-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">{children}</p>;
}

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
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {meta.map((item) => (
          <div key={item.label} className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
            <p className="mt-1 truncate font-mono text-sm font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <StatusBadge label={status} classes={getRequestStatusClasses(status)} />
        {onApprove && onReject && (
          <div className="flex gap-2">
            <button onClick={onReject} className="rounded-full border border-red-300/30 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-400/10">
              Reject
            </button>
            <button onClick={onApprove} className="rounded-full bg-violet-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-white">
              {approveLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
