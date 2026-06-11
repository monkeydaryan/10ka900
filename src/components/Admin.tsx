import { useMemo, useState, Fragment } from "react";
import type { ReactNode } from "react";
import { Banknote, Headset, KeyRound, Landmark, ListChecks, Radio, Users } from "lucide-react";
import {
  MAX_DOUBLE_BET,
  MIN_DEPOSIT,
  MIN_WITHDRAW,
  OWNER_EMAIL,
  formatCredits,
  getMarketStatusClasses,
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
      <div className="grid-bg fixed inset-0 opacity-40 -z-10 pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-[1450px]">
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

        {tab === "overview" && <OverviewTab users={users} bets={bets} deposits={pendingDeposits} withdrawals={pendingWithdrawals} tickets={openTickets} events={events} markets={markets} />}
        {tab === "users" && <UsersTab users={users} events={events} />}
        {tab === "bets" && <BetsTab bets={bets} onRejectBet={onRejectBet} />}
        {tab === "deposits" && <DepositsTab deposits={deposits} onApprove={onApproveDeposit} onReject={onRejectDeposit} />}
        {tab === "withdrawals" && <WithdrawalsTab withdrawals={withdrawals} onApprove={onApproveWithdraw} onReject={onRejectWithdraw} />}
        {tab === "support" && <SupportTab tickets={tickets} onResolve={onResolveTicket} />}
        {tab === "settlement" && <SettlementTab bets={bets} markets={markets} onSettleMarket={onSettleMarket} onCloseMarket={onCloseMarket} onOpenMarket={onOpenMarket} />}
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
        .map((market) => {
          const pendingBets = bets.filter((bet) => bet.marketId === market.id && bet.status === "pending");
          return {
            id: market.id,
            name: market.name,
            status: market.status,
            pendingCount: pendingBets.length,
            pendingStake: pendingBets.reduce((sum, bet) => sum + bet.stake, 0),
          };
        })
        .sort((a, b) => b.pendingStake - a.pendingStake),
    [markets, bets],
  );

  const openMarkets = markets.filter((market) => market.status === "open").length;
  const lockedMarkets = markets.filter((market) => market.status === "locked").length;
  const settledMarkets = markets.filter((market) => market.status === "settled").length;

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoStrip label="Registered users" value={String(users.length)} />
        <InfoStrip label="Total bets placed" value={String(bets.length)} />
        <InfoStrip label="Pending deposits" value={String(deposits.length)} />
        <InfoStrip label="Pending withdrawals" value={String(withdrawals.length)} />
        <InfoStrip label="Open support tickets" value={String(tickets.length)} />
        <InfoStrip label="Total balance in wallets" value={formatCredits(users.reduce((sum, u) => sum + u.wallet, 0))} />
      </div>

      <SectionCard>
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoStrip label="Open markets" value={String(openMarkets)} />
          <InfoStrip label="Locked markets" value={String(lockedMarkets)} />
          <InfoStrip label="Settled markets" value={String(settledMarkets)} />
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center gap-3">
          <ListChecks className="h-5 w-5 text-violet-200" />
          <h2 className="text-xl font-bold">Market exposure snapshot</h2>
        </div>
        <p className="mt-2 text-sm text-slate-400">Pending risk per market, including locked markets that have not yet settled.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="py-3 pr-4">Market</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Pending bets</th>
                <th className="py-3">Pending stake</th>
              </tr>
            </thead>
            <tbody>
              {marketSummaries.map((summary) => (
                <tr key={summary.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 text-slate-300">{summary.name}</td>
                  <td className="py-3 pr-4"><StatusBadge label={summary.status} classes={getMarketStatusClasses(summary.status)} /></td>
                  <td className="py-3 pr-4 text-white font-semibold">{summary.pendingCount}</td>
                  <td className="py-3 font-mono text-cyan-100">{formatCredits(summary.pendingStake)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

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
                <th className="py-3 pr-4">Balance</th>
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
                  <td className="py-3 pr-4 font-mono text-emerald-200">{formatCredits(user.wallet)}</td>
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

function BetsTab({ bets, onRejectBet }: { bets: Bet[]; onRejectBet: (betId: string) => void }) {
  const pendingBets = bets.filter((bet) => bet.status === "pending");
  const totalBetsPlaced = bets.length;
  const totalStakePlaced = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const exposure = useMemo(
    () =>
      Array.from(
        pendingBets.reduce((map, bet) => {
          const key = `${bet.marketName}|${bet.mode}|${bet.selection}`;
          const current = map.get(key);
          if (current) {
            current.totalStake += bet.stake;
            current.count += 1;
          } else {
            map.set(key, { key, marketName: bet.marketName, mode: bet.mode, selection: bet.selection, totalStake: bet.stake, count: 1 });
          }
          return map;
        }, new Map<string, { key: string; marketName: string; mode: BetMode; selection: string; totalStake: number; count: number }>()),
      ).sort((a, b) => b.totalStake - a.totalStake),
    [pendingBets],
  );
  const singleNumberTotals = useMemo(() => {
    const map = new Map<string, { key: string; label: string; totalStake: number; count: number }>();
    bets.forEach((bet) => {
      const label = bet.mode === "double" ? `Double ${bet.selection}` : `${bet.splitSide} ${bet.selection}`;
      const key = `${bet.marketName}|${label}`;
      const current = map.get(key);
      if (current) {
        current.totalStake += bet.stake;
        current.count += 1;
      } else {
        map.set(key, { key, label, totalStake: bet.stake, count: 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalStake - a.totalStake).slice(0, 10);
  }, [bets]);
  const exposureByMarket = useMemo(() => {
    const marketMap = new Map<string, { marketName: string; totals: Map<string, number>; totalStake: number; count: number }>();
    pendingBets.forEach((bet) => {
      const existing = marketMap.get(bet.marketId);
      if (existing) {
        existing.totals.set(bet.selection, (existing.totals.get(bet.selection) ?? 0) + bet.stake);
        existing.totalStake += bet.stake;
        existing.count += 1;
      } else {
        marketMap.set(bet.marketId, {
          marketName: bet.marketName,
          totals: new Map([[bet.selection, bet.stake]]),
          totalStake: bet.stake,
          count: 1,
        });
      }
    });
    return Array.from(marketMap.values()).map((item) => ({
      ...item,
      selections: Array.from(item.totals.entries()).sort((a, b) => b[1] - a[1]),
      maxStake: Math.max(...Array.from(item.totals.values()), 0),
    }));
  }, [pendingBets]);
  const totalPendingStake = pendingBets.reduce((sum, bet) => sum + bet.stake, 0);
  const topExposure = exposure[0];

  return (
    <div className="space-y-5">
      <SectionCard>
        <div className="flex items-center gap-3">
          <ListChecks className="h-5 w-5 text-violet-200" />
          <h2 className="text-xl font-bold">Every bet, live</h2>
          <LiveDot />
        </div>
        <p className="mt-2 text-sm text-slate-400">Review exposure by number and reject pending bets manually to refund stakes instantly.</p>
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <SectionCard className="p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Total bets placed</p>
          <p className="mt-3 font-mono text-3xl font-black text-white">{totalBetsPlaced}</p>
          <p className="mt-2 text-sm text-slate-400">Total bets recorded in the system across every market.</p>
        </SectionCard>
        <SectionCard className="p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Total stake placed</p>
          <p className="mt-3 font-mono text-3xl font-black text-white">{formatCredits(totalStakePlaced)}</p>
          <p className="mt-2 text-sm text-slate-400">Total credits wagered across all bets.</p>
        </SectionCard>
        <SectionCard className="p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Pending exposure</p>
          <p className="mt-3 font-mono text-3xl font-black text-white">{formatCredits(totalPendingStake)}</p>
          <p className="mt-2 text-sm text-slate-400">Total amount currently at risk across all pending bets.</p>
        </SectionCard>
      </div>

      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">Market bet chart</h3>
            <p className="mt-2 text-sm text-slate-400">Live heatmap showing total stakes placed by selection for each market.</p>
          </div>
          <div className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-300">
            {pendingBets.length} live pending bet{pendingBets.length === 1 ? "" : "s"}
          </div>
        </div>
        {exposureByMarket.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No pending bets to chart yet.</p>
        ) : (
          <div className="mt-4 space-y-6">
            {exposureByMarket.map((market) => (
              <div key={market.marketName} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-white">{market.marketName}</p>
                  <p className="text-sm text-slate-400">{formatCredits(market.maxStake)} top stake</p>
                </div>
                <div className="mt-4 space-y-3">
                  {market.selections.slice(0, 6).map(([selection, amount]) => (
                    <div key={selection}>
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>{selection}</span>
                        <span>{formatCredits(amount)}</span>
                      </div>
                      <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-900">
                        <div
                          className="h-full rounded-full bg-cyan-300"
                          style={{ width: `${amount === 0 ? 3 : Math.max(6, (amount / market.maxStake) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <SectionCard>
        <h3 className="text-xl font-bold">Exposure by selection</h3>
        <p className="mt-2 text-sm text-slate-400">This table totals all pending stakes on a single number or double, grouped by market.</p>
        {exposure.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No pending bets to expose yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="py-3 pr-4">Market</th>
                  <th className="py-3 pr-4">Type</th>
                  <th className="py-3 pr-4">Selection</th>
                  <th className="py-3 pr-4">Total stake</th>
                  <th className="py-3">Bets</th>
                </tr>
              </thead>
              <tbody>
                {exposure.map((item) => (
                  <tr key={item.key} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-slate-300">{item.marketName}</td>
                    <td className="py-3 pr-4 text-slate-300">{item.mode === "double" ? "Double" : "Split"}</td>
                    <td className="py-3 pr-4 text-white font-semibold">{item.selection}</td>
                    <td className="py-3 pr-4 font-mono text-cyan-100">{formatCredits(item.totalStake)}</td>
                    <td className="py-3 text-slate-400">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <h3 className="text-xl font-bold">Top single-number totals</h3>
        <p className="mt-2 text-sm text-slate-400">Shows the highest amount wagered on a single selection across all markets.</p>
        {singleNumberTotals.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No bets placed yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="py-3 pr-4">Selection</th>
                  <th className="py-3 pr-4">Total stake</th>
                  <th className="py-3">Bets</th>
                </tr>
              </thead>
              <tbody>
                {singleNumberTotals.map((item) => (
                  <tr key={item.key} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-white font-semibold">{item.label}</td>
                    <td className="py-3 pr-4 font-mono text-cyan-100">{formatCredits(item.totalStake)}</td>
                    <td className="py-3 text-slate-400">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <h3 className="text-xl font-bold">Pending bets</h3>
        <div className="mt-4 space-y-3">
          {pendingBets.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No pending bets at the moment.</p>
          ) : (
            pendingBets.map((bet) => (
              <div key={bet.id} className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-bold text-white">{bet.marketName} · {bet.mode === "double" ? "Double" : bet.splitSide} {bet.selection}</p>
                  <p className="mt-1 text-sm text-slate-300">{bet.userName} · {bet.userId} · stake {formatCredits(bet.stake)}</p>
                  <p className="mt-1 text-sm uppercase tracking-[0.18em] text-slate-400">Status: {bet.status === "refunded" ? "Refunded" : bet.status}</p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <button onClick={() => onRejectBet(bet.id)} className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400">
                    Reject bet & refund
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
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
              approveLabel="Approve & credit wallet"
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
      <p className="mt-1 text-sm text-slate-400">The amount is already on hold from the user's wallet balance. Approve to initiate the bank payout, or reject to refund the hold.</p>
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

function SettlementTab({ bets, markets, onSettleMarket, onCloseMarket, onOpenMarket }: { bets: Bet[]; markets: Market[]; onSettleMarket: (marketId: MarketId, resultDecimal: string) => void; onCloseMarket: (marketId: MarketId) => void; onOpenMarket: (marketId: MarketId) => void }) {
  const [selectedMarket, setSelectedMarket] = useState<MarketId>(markets[0]?.id ?? "hsi");
  const [resultDigits, setResultDigits] = useState("31");

  const activeMarket = markets.find((market) => market.id === selectedMarket);
  const marketSummaries = useMemo(() =>
    markets.map((market) => {
      const marketBets = bets.filter((bet) => bet.marketId === market.id);
      const pendingBetCount = marketBets.filter((bet) => bet.status === "pending").length;
      const totalStake = marketBets.reduce((sum, bet) => sum + bet.stake, 0);
      return {
        id: market.id,
        name: market.name,
        status: market.status,
        result: market.resultDecimal ?? "--",
        totalBets: marketBets.length,
        pendingBetCount,
        totalStake,
      };
    }),
    [bets, markets],
  );

  const selectedSummary = marketSummaries.find((summary) => summary.id === selectedMarket);
  const selectionTotals = useMemo(() => {
    const map = new Map<string, { selection: string; totalStake: number; count: number }>();
    bets.filter((bet) => bet.marketId === selectedMarket).forEach((bet) => {
      const label = bet.mode === "double" ? `Double ${bet.selection}` : `${bet.splitSide} ${bet.selection}`;
      const current = map.get(label);
      if (current) {
        current.totalStake += bet.stake;
        current.count += 1;
      } else {
        map.set(label, { selection: label, totalStake: bet.stake, count: 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalStake - a.totalStake).slice(0, 12);
  }, [bets, selectedMarket]);

  const [expandedMarketId, setExpandedMarketId] = useState<MarketId | null>(null);
  const selectionTotalsByMarket = useMemo(() => {
    const map = new Map<MarketId, { selection: string; totalStake: number; count: number }[]>();
    markets.forEach((market) => {
      const sel = new Map<string, { selection: string; totalStake: number; count: number }>();
      bets
        .filter((b) => b.marketId === market.id)
        .forEach((bet) => {
          const label = bet.mode === "double" ? `Double ${bet.selection}` : `${bet.splitSide} ${bet.selection}`;
          const cur = sel.get(label);
          if (cur) {
            cur.totalStake += bet.stake;
            cur.count += 1;
          } else {
            sel.set(label, { selection: label, totalStake: bet.stake, count: 1 });
          }
        });
      map.set(market.id, Array.from(sel.values()).sort((a, b) => b.totalStake - a.totalStake));
    });
    return map;
  }, [bets, markets]);

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
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => onSettleMarket(selectedMarket, resultDigits || "00")} className="w-full rounded-2xl bg-violet-300 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white">
              Settle bets now
            </button>
            <button
              onClick={() => (activeMarket?.status === "open" ? onCloseMarket(selectedMarket) : onOpenMarket(selectedMarket))}
              className={`w-full rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-[0.2em] transition ${activeMarket?.status === "open" ? "bg-red-500 text-white hover:bg-red-400" : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"}`}
            >
              {activeMarket?.status === "open" ? "Close market" : "Open market"}
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-400">Manual close locks betting immediately; pending stakes are refunded to users. Reopen the market to allow new bets again.</p>

          {selectedSummary ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <h3 className="text-lg font-bold">Selected market summary</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total bets</p>
                  <p className="mt-2 text-3xl font-black text-white">{selectedSummary.totalBets}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pending bets</p>
                  <p className="mt-2 text-3xl font-black text-white">{selectedSummary.pendingBetCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total stake</p>
                  <p className="mt-2 text-3xl font-black text-cyan-100">{formatCredits(selectedSummary.totalStake)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last result</p>
                  <p className="mt-2 text-3xl font-black text-white">{selectedSummary.result}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Selected market number totals</h3>
                <p className="mt-2 text-sm text-slate-400">Totals wagered on each selection for the chosen market.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">Top {selectionTotals.length} selections</span>
            </div>
            {selectionTotals.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No bets placed for this market yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                      <th className="py-3 pr-4">Selection</th>
                      <th className="py-3 pr-4">Total stake</th>
                      <th className="py-3">Bets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectionTotals.map((item) => (
                      <tr key={item.selection} className="border-b border-white/5">
                        <td className="py-3 pr-4 text-white font-semibold">{item.selection}</td>
                        <td className="py-3 pr-4 font-mono text-cyan-100">{formatCredits(item.totalStake)}</td>
                        <td className="py-3 text-slate-400">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="text-xl font-bold">Market totals</h3>
        <p className="mt-2 text-sm text-slate-400">Totals for every market, including pending bets and overall stake placed.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="py-3 pr-4">Market</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Total bets</th>
                <th className="py-3 pr-4">Pending bets</th>
                <th className="py-3">Total stake</th>
              </tr>
            </thead>
            <tbody>
              {marketSummaries.map((summary) => (
                <Fragment key={summary.id}>
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-4 text-slate-300">{summary.name}</td>
                  <td className="py-3 pr-4"><StatusBadge label={summary.status} classes={getMarketStatusClasses(summary.status)} /></td>
                  <td className="py-3 pr-4 font-semibold text-white">{summary.totalBets}</td>
                  <td className="py-3 pr-4 text-slate-300">{summary.pendingBetCount}</td>
                  <td className="py-3 font-mono text-cyan-100">{formatCredits(summary.totalStake)}</td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => setExpandedMarketId(expandedMarketId === summary.id ? null : summary.id)}
                      className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300 hover:bg-white/5"
                    >
                      {expandedMarketId === summary.id ? "Hide selections" : "Show selections"}
                    </button>
                  </td>
                </tr>
                {expandedMarketId === summary.id && (
                  <tr className="bg-slate-950/50">
                    <td colSpan={6} className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                              <th className="py-3 pr-4">Selection</th>
                              <th className="py-3 pr-4">Total stake</th>
                              <th className="py-3">Bets</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectionTotalsByMarket.get(summary.id) ?? []).slice(0, 30).map((s) => (
                              <tr key={s.selection} className="border-b border-white/5">
                                <td className="py-3 pr-4 text-white font-semibold">{s.selection}</td>
                                <td className="py-3 pr-4 font-mono text-cyan-100">{formatCredits(s.totalStake)}</td>
                                <td className="py-3 text-slate-400">{s.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="text-xl font-bold">Integrity checklist</h3>
        <ChecklistItem>Double-digit winners pay 90x (max {MAX_DOUBLE_BET} stake per number); Andar/Bahar pays 9x — settled atomically per market.</ChecklistItem>
        <ChecklistItem>Deposits below {MIN_DEPOSIT} credits and withdrawals below {MIN_WITHDRAW} credits are rejected client- and server-side.</ChecklistItem>
        <ChecklistItem>Betting cutoffs: Taiwan 10:53 AM · KOSPI 11:53 AM · Hang Seng 1:32 PM · SENSEX 3:23 PM · DAX 8:55 PM · Dow Jones 12:00 AM.</ChecklistItem>
        <ChecklistItem>Duplicate transaction IDs cannot be submitted twice.</ChecklistItem>
        <ChecklistItem>Withdrawal amounts are held immediately to prevent double spending; rejects refund instantly.</ChecklistItem>
        <ChecklistItem>Manual market lock refunds all pending bets to user wallets.</ChecklistItem>
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
