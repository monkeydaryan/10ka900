import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Banknote,
  Bot,
  CheckCircle2,
  Gauge,
  Headset,
  ImagePlus,
  Landmark,
  LockKeyhole,
  Paperclip,
  QrCode,
  Send,
  ShieldCheck,
  TimerReset,
  Trophy,
  UserCircle2,
  WalletCards,
  XCircle,
} from "lucide-react";
import {
  BRAND,
  DOUBLE_MULTIPLIER,
  MAX_DOUBLE_BET,
  MIN_DEPOSIT,
  MIN_WITHDRAW,
  SPLIT_MULTIPLIER,
  formatCredits,
  getMarketStatusClasses,
  getRequestStatusClasses,
  isBettingOpen,
  timeAgo,
  timeUntilCutoff,
} from "@/lib/types";
import type {
  Bet,
  BetMode,
  DepositRequest,
  Market,
  MarketId,
  SplitSide,
  SupportTicket,
  UserProfile,
  WithdrawRequest,
} from "@/lib/types";
import { Field, InfoStrip, PasswordChangeForm, SectionCard, StatusBadge, inputClasses } from "@/components/ui";

export type UserTab = MarketId | "bets" | "wallet" | "support" | "profile";

/** Live ticking clock, updates every second. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  return now;
}

export interface WithdrawForm {
  amount: number;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
}

export function Dashboard({
  user,
  markets,
  bets,
  deposits,
  withdrawals,
  tickets,
  activeTab,
  onTabChange,
  onLogout,
  onPlaceBet,
  onDeposit,
  onWithdraw,
  onTicket,
  onChangePassword,
}: {
  user: UserProfile;
  markets: Market[];
  bets: Bet[];
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  tickets: SupportTicket[];
  activeTab: UserTab;
  onTabChange: (tab: UserTab) => void;
  onLogout: () => void;
  onPlaceBet: (market: Market, mode: BetMode, selection: string, stake: number, splitSide?: SplitSide) => string | null;
  onDeposit: (transactionId: string, amount: number) => string | null;
  onWithdraw: (form: WithdrawForm) => string | null;
  onTicket: (topic: string, message: string, transactionId?: string, screenshot?: string, screenshotName?: string) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
}) {
  const activeMarket = markets.find((market) => market.id === activeTab);
  const pendingBetsCount = bets.filter((bet) => bet.status === "pending").length;
  const pendingStake = bets.filter((bet) => bet.status === "pending").reduce((sum, bet) => sum + bet.stake, 0);

  return (
    <main className="min-h-screen bg-[#050813] text-white">
      <div className="grid-bg fixed inset-0 opacity-50" />
      <div className="relative mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-cyan-200/70">{BRAND} terminal</p>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.07em] sm:text-5xl">Market close arena</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-4 xl:min-w-[900px]">
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-3">
              <div className="flex items-center gap-3">
                <LockKeyhole className="h-5 w-5 shrink-0 text-cyan-200" />
                <div className="min-w-0">
                  <p className="truncate text-xs uppercase tracking-[0.24em] text-slate-400">Locked profile</p>
                  <p className="truncate font-mono text-sm font-bold text-cyan-100">{user.userId}</p>
                </div>
              </div>
            </div>
            <MetricPill icon={<WalletCards className="h-4 w-4" />} label="Demo wallet" value={formatCredits(user.wallet)} />
            <MetricPill
              icon={<Banknote className="h-4 w-4" />}
              label="My balance"
              value={formatCredits(user.realWallet)}
              accent
            />
            <MetricPill
              icon={<TimerReset className="h-4 w-4" />}
              label="Pending bets"
              value={`${pendingBetsCount} · ${formatCredits(pendingStake)}`}
            />
          </div>
          <button onClick={onLogout} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/40 hover:text-white">
            Logout
          </button>
        </header>

        <div className="flex gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-2">
          {markets.map((market) => (
            <TabButton key={market.id} active={activeTab === market.id} onClick={() => onTabChange(market.id)} accent="cyan">
              {market.name}
            </TabButton>
          ))}
          <TabButton active={activeTab === "bets"} onClick={() => onTabChange("bets")} accent="white">
            My Bets
          </TabButton>
          <TabButton active={activeTab === "wallet"} onClick={() => onTabChange("wallet")} accent="white">
            My Balance
          </TabButton>
          <TabButton active={activeTab === "support"} onClick={() => onTabChange("support")} accent="white">
            Talk to Agent
          </TabButton>
          <TabButton active={activeTab === "profile"} onClick={() => onTabChange("profile")} accent="white">
            Profile
          </TabButton>
        </div>

        <section className="mt-5 animate-fade-up">
          {activeMarket ? (
            <MarketPanel market={activeMarket} bets={bets} wallet={user.wallet} onPlaceBet={onPlaceBet} />
          ) : activeTab === "bets" ? (
            <BetsPanel bets={bets} />
          ) : activeTab === "wallet" ? (
            <WalletPanel user={user} deposits={deposits} withdrawals={withdrawals} onDeposit={onDeposit} onWithdraw={onWithdraw} />
          ) : activeTab === "profile" ? (
            <ProfilePanel user={user} bets={bets} onChangePassword={onChangePassword} />
          ) : (
            <SupportPanel tickets={tickets} onTicket={onTicket} />
          )}
        </section>
      </div>
    </main>
  );
}

function TabButton({ active, onClick, accent, children }: { active: boolean; onClick: () => void; accent: "cyan" | "white"; children: ReactNode }) {
  const activeClass = accent === "cyan" ? "bg-cyan-300 text-slate-950" : "bg-white text-slate-950";
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? activeClass : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function MetricPill({ icon, label, value, accent = false }: { icon: ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-3xl border px-4 py-3 ${accent ? "border-emerald-400/30 bg-emerald-400/[0.07]" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="flex items-center gap-3 text-slate-300">
        <span className={accent ? "text-emerald-200" : "text-cyan-200"}>{icon}</span>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className={`truncate font-bold ${accent ? "text-emerald-100" : "text-white"}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Market + betting                                                    */
/* ------------------------------------------------------------------ */

function MarketPanel({
  market,
  bets,
  wallet,
  onPlaceBet,
}: {
  market: Market;
  bets: Bet[];
  wallet: number;
  onPlaceBet: (market: Market, mode: BetMode, selection: string, stake: number, splitSide?: SplitSide) => string | null;
}) {
  const now = useNow();
  const marketBets = bets.filter((bet) => bet.marketId === market.id);
  const pendingMarketBets = marketBets.filter((bet) => bet.status === "pending");
  const marketPendingStake = pendingMarketBets.reduce((sum, bet) => sum + bet.stake, 0);
  const bettingOpen = isBettingOpen(market, now);
  const countdown = timeUntilCutoff(market, now);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-5">
        <SectionCard>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.36em] text-cyan-200/80">{market.symbol}</p>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.07em] text-white">{market.name}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {market.country} close: {market.closeTime} {market.timezone}
              </p>
            </div>
            <StatusBadge
              label={market.status === "open" ? "betting open" : market.status === "locked" ? "locked by admin" : "settled"}
              classes={getMarketStatusClasses(market.status)}
            />
          </div>

          <div className={`mt-6 grid gap-4 rounded-[1.5rem] border p-4 sm:grid-cols-3 ${bettingOpen ? "border-emerald-400/25 bg-emerald-400/[0.05]" : "border-red-400/25 bg-red-400/[0.05]"}`}>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current time</p>
              <p className="mt-1 font-mono text-2xl font-black text-white">
                {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Betting closes at</p>
              <p className="mt-1 font-mono text-2xl font-black text-amber-200">{market.cutoffLabel}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              {market.status === "locked" ? "Admin lock" : bettingOpen ? "Time left to bet" : "Status"}
            </p>
            <p className={`mt-1 font-mono text-2xl font-black ${market.status === "open" ? "text-emerald-200" : "text-red-200"}`}>
              {market.status === "locked" ? "LOCKED" : bettingOpen ? countdown : "CLOSED"}
            </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <TickerMetric label="Last close" value={market.lastPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })} />
            <TickerMetric label="Change" value={`${market.change > 0 ? "+" : ""}${market.change}%`} tone={market.change >= 0 ? "good" : "bad"} />
            <TickerMetric label="Winning digits" value={`.${market.resultDecimal}`} tone="accent" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoStrip label="Pending bets" value={String(pendingMarketBets.length)} />
            <InfoStrip label="Stake at risk" value={formatCredits(marketPendingStake)} />
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-slate-500">Historical closing decimals</p>
            <div className="flex flex-wrap gap-2">
              {market.history.map((digit, index) => (
                <span key={`${digit}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-lg font-black text-cyan-100">
                  .{digit}
                </span>
              ))}
            </div>
          </div>

          <a href={market.source} target="_blank" rel="noreferrer" className="mt-6 inline-flex text-sm text-cyan-200 underline-offset-4 hover:underline">
            Yahoo Finance source endpoint
          </a>
        </SectionCard>

        <SectionCard>
          <h3 className="text-xl font-bold">Your bets on this market</h3>
          <div className="mt-4 space-y-3">
            {marketBets.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No bets placed on this market yet.</p>
            ) : (
              marketBets.slice(0, 4).map((bet) => <BetRow key={bet.id} bet={bet} />)
            )}
          </div>
        </SectionCard>
      </div>

      <BettingWidget market={market} wallet={wallet} onPlaceBet={onPlaceBet} />
    </div>
  );
}

function TickerMetric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "good" | "bad" | "accent" }) {
  const toneClass = tone === "good" ? "text-emerald-200" : tone === "bad" ? "text-red-200" : tone === "accent" ? "text-cyan-200" : "text-white";
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className={`mt-2 font-mono text-2xl font-black ${toneClass}`}>{value}</p>
    </div>
  );
}

function BettingWidget({
  market,
  wallet,
  onPlaceBet,
}: {
  market: Market;
  wallet: number;
  onPlaceBet: (market: Market, mode: BetMode, selection: string, stake: number, splitSide?: SplitSide) => string | null;
}) {
  const [mode, setMode] = useState<BetMode>("double");
  const [doubleSelection, setDoubleSelection] = useState("89");
  const [andarSelection, setAndarSelection] = useState("8");
  const [baharSelection, setBaharSelection] = useState("9");
  const [splitSide, setSplitSide] = useState<SplitSide>("Andar");
  const [stake, setStake] = useState(10);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const now = useNow();
  const bettingOpen = isBettingOpen(market, now);
  const countdown = timeUntilCutoff(market, now);
  const selection = mode === "double" ? doubleSelection : splitSide === "Andar" ? andarSelection : baharSelection;
  const multiplier = mode === "double" ? DOUBLE_MULTIPLIER : SPLIT_MULTIPLIER;
  const overMax = mode === "double" && stake > MAX_DOUBLE_BET;
  const potential = Math.max(0, Math.floor(stake)) * multiplier;
  const disabled = !bettingOpen || stake <= 0 || wallet < stake || overMax;

  return (
    <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.05] p-5 shadow-2xl shadow-cyan-950/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">Core betting widget</p>
          <h3 className="mt-2 text-3xl font-black tracking-[-0.06em]">Pick the close decimal</h3>
        </div>
        <div className="flex rounded-full border border-white/10 bg-slate-950/50 p-1">
          <button onClick={() => setMode("double")} className={`rounded-full px-4 py-2 text-sm font-bold ${mode === "double" ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`}>
            00-99 · 90x
          </button>
          <button onClick={() => setMode("split")} className={`rounded-full px-4 py-2 text-sm font-bold ${mode === "split" ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`}>
            Andar/Bahar · 9x
          </button>
        </div>
      </div>

      {mode === "double" ? (
        <div className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {Array.from({ length: 100 }, (_, index) => index.toString().padStart(2, "0")).map((digit) => (
            <button
              key={digit}
              onClick={() => setDoubleSelection(digit)}
              className={`aspect-square rounded-2xl border text-sm font-black transition sm:text-base ${doubleSelection === digit ? "border-cyan-200 bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)]" : "border-white/10 bg-slate-950/60 text-slate-300 hover:border-cyan-300/40 hover:text-white"}`}
            >
              {digit}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <DigitColumn title="Andar" subtitle="Tens decimal position" selected={andarSelection} active={splitSide === "Andar"} onActivate={() => setSplitSide("Andar")} onSelect={setAndarSelection} />
          <DigitColumn title="Bahar" subtitle="Ones decimal position" selected={baharSelection} active={splitSide === "Bahar"} onActivate={() => setSplitSide("Bahar")} onSelect={setBaharSelection} />
        </div>
      )}

      <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 lg:grid-cols-[1fr_1.2fr]">
        <label>
          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">
            Stake (demo credits){mode === "double" ? ` · max ${MAX_DOUBLE_BET}` : ""}
          </span>
          <input
            type="number"
            min={1}
            max={mode === "double" ? MAX_DOUBLE_BET : undefined}
            value={stake}
            onChange={(event) => setStake(Number(event.target.value))}
            className={`w-full rounded-2xl border bg-black/40 px-4 py-3 font-mono text-lg font-bold text-white outline-none focus:border-cyan-300/60 ${overMax ? "border-red-400/60" : "border-white/10"}`}
          />
          {overMax && (
            <span className="mt-2 block text-xs font-semibold text-red-300">
              Highest bet on a single double-digit number is {MAX_DOUBLE_BET} credits.
            </span>
          )}
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SlipMetric label="Selection" value={mode === "double" ? selection : `${splitSide} ${selection}`} />
          <SlipMetric label="Multiplier" value={`${multiplier}x`} />
          <SlipMetric label="Potential" value={formatCredits(potential)} />
          <SlipMetric label="Balance" value={formatCredits(wallet)} />
        </div>
      </div>

      {feedback && (
        <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${feedback.kind === "ok" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>
          {feedback.text}
        </p>
      )}

      <button
        disabled={disabled}
        onClick={() => {
          const error = onPlaceBet(market, mode, selection, Math.floor(stake), mode === "split" ? splitSide : undefined);
          setFeedback(error ? { kind: "err", text: error } : { kind: "ok", text: `Bet placed on ${mode === "double" ? selection : `${splitSide} ${selection}`} — potential return ${formatCredits(potential)}.` });
        }}
        className="mt-4 w-full rounded-2xl bg-cyan-300 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {!bettingOpen
          ? market.status === "locked"
            ? "Betting locked by admin"
            : `Betting closed — cutoff ${market.cutoffLabel}`
          : overMax
            ? `Max ${MAX_DOUBLE_BET} on double digit`
            : wallet < stake
              ? "Insufficient demo credits"
              : "Place bet"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">
        {bettingOpen
          ? `Unlimited bets per day. Betting stops at ${market.cutoffLabel} sharp — ${countdown} left.`
          : market.status === "locked"
            ? "This market is locked by the admin. Any pending bets were refunded on closure."
            : `Betting reopens after settlement. Today's cutoff was ${market.cutoffLabel}.`}
      </p>
    </section>
  );
}

function DigitColumn({
  title,
  subtitle,
  selected,
  active,
  onActivate,
  onSelect,
}: {
  title: SplitSide;
  subtitle: string;
  selected: string;
  active: boolean;
  onActivate: () => void;
  onSelect: (digit: string) => void;
}) {
  return (
    <div className={`rounded-[1.5rem] border p-4 ${active ? "border-cyan-300/50 bg-cyan-300/[0.08]" : "border-white/10 bg-slate-950/50"}`}>
      <button onClick={onActivate} className="mb-4 text-left">
        <h4 className="text-xl font-black">{title}</h4>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </button>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 10 }, (_, index) => String(index)).map((digit) => (
          <button
            key={digit}
            onClick={() => {
              onActivate();
              onSelect(digit);
            }}
            className={`aspect-square rounded-xl border font-black transition ${selected === digit && active ? "border-cyan-200 bg-cyan-300 text-slate-950" : "border-white/10 bg-slate-950/80 text-slate-300 hover:border-cyan-300/40"}`}
          >
            {digit}
          </button>
        ))}
      </div>
    </div>
  );
}

function SlipMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 truncate font-mono text-sm font-black text-white">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bets ledger                                                         */
/* ------------------------------------------------------------------ */

function BetsPanel({ bets }: { bets: Bet[] }) {
  const analytics = useMemo(() => {
    const won = bets.filter((bet) => bet.status === "won").length;
    const lost = bets.filter((bet) => bet.status === "lost").length;
    const staked = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const paid = bets.reduce((sum, bet) => sum + (bet.payout ?? 0), 0);
    return { won, lost, staked, paid };
  }, [bets]);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <SectionCard>
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">Unified betting ledger</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.06em]">Win / loss analytics</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoStrip label="Total bets" value={String(bets.length)} />
          <InfoStrip label="Wins" value={String(analytics.won)} />
          <InfoStrip label="Losses" value={String(analytics.lost)} />
          <InfoStrip label="Net return" value={formatCredits(analytics.paid - analytics.staked)} />
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold">Active, pending, and settled bets</h3>
          <Gauge className="h-5 w-5 text-cyan-200" />
        </div>
        <div className="mt-4 space-y-3">
          {bets.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">Your ledger is empty. Open a market tab to place the first bet.</p>
          ) : (
            bets.map((bet) => <BetRow key={bet.id} bet={bet} />)
          )}
        </div>
      </SectionCard>
    </div>
  );
}

export function BetRow({ bet, showUser = false }: { bet: Bet; showUser?: boolean }) {
  const statusIcon =
    bet.status === "won" ? (
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-200" />
    ) : bet.status === "lost" ? (
      <XCircle className="h-5 w-5 shrink-0 text-red-200" />
    ) : bet.status === "refunded" ? (
      <XCircle className="h-5 w-5 shrink-0 text-slate-400" />
    ) : (
      <TimerReset className="h-5 w-5 shrink-0 text-amber-200" />
    );
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:grid-cols-[1.3fr_0.8fr_0.8fr_0.6fr] sm:items-center">
      <div className="flex items-center gap-3">
        {statusIcon}
        <div className="min-w-0">
          <p className="truncate font-bold text-white">
            {bet.marketName}
            {showUser && <span className="ml-2 font-mono text-xs font-normal text-cyan-200">{bet.userId}</span>}
          </p>
          <p className="truncate text-sm text-slate-400">
            {bet.mode === "double" ? "Double" : bet.splitSide} selection: {bet.selection} · {timeAgo(bet.placedAt)}
          </p>
        </div>
      </div>
      <p className="font-mono text-sm text-slate-300">Stake {formatCredits(bet.stake)}</p>
      <p className="font-mono text-sm text-cyan-100">Potential {formatCredits(bet.potentialReturn)}</p>
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-300">{bet.status}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Real credits wallet                                                 */
/* ------------------------------------------------------------------ */

function WalletPanel({
  user,
  deposits,
  withdrawals,
  onDeposit,
  onWithdraw,
}: {
  user: UserProfile;
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  onDeposit: (transactionId: string, amount: number) => string | null;
  onWithdraw: (form: WithdrawForm) => string | null;
}) {
  const [txId, setTxId] = useState("");
  const [amount, setAmount] = useState(MIN_DEPOSIT);
  const [depositMsg, setDepositMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [wAmount, setWAmount] = useState(MIN_WITHDRAW);
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [withdrawMsg, setWithdrawMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const pendingDeposits = deposits.filter((d) => d.status === "pending").length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending").length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <InfoStrip label="My balance" value={formatCredits(user.realWallet)} />
        <InfoStrip label="Demo wallet" value={formatCredits(user.wallet)} />
        <InfoStrip label="Pending deposits" value={String(pendingDeposits)} />
        <InfoStrip label="Pending withdrawals" value={String(pendingWithdrawals)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Deposit */}
        <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.05] p-5">
          <div className="flex items-center gap-3">
            <QrCode className="h-7 w-7 text-cyan-200" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Deposit demo credits</p>
              <h2 className="text-3xl font-black tracking-[-0.06em]">Scan &amp; pay</h2>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row">
            <img
              src="images/deposit-qr.png"
              alt="Deposit payment QR code"
              className="h-56 w-56 shrink-0 rounded-[1.5rem] border border-white/10 bg-white object-cover shadow-[0_0_40px_rgba(34,211,238,0.15)]"
            />
            <div className="min-w-0">
              <p className="font-mono text-sm text-cyan-100">Payment reference: {user.userId}</p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-300">
                <li>Scan the QR with any UPI app and pay your deposit amount.</li>
                <li>Minimum deposit is <span className="font-bold text-white">{MIN_DEPOSIT} credits</span>.</li>
                <li>Paste the exact transaction ID below.</li>
                <li>Admin verifies your User ID + transaction ID, then credits your real wallet.</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label={`Amount paid (min ${MIN_DEPOSIT})`}>
              <input type="number" min={MIN_DEPOSIT} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={inputClasses} />
            </Field>
            <Field label="Transaction ID">
              <input value={txId} onChange={(e) => setTxId(e.target.value)} className={`${inputClasses} font-mono`} placeholder="e.g. T2409UPI88231" />
            </Field>
          </div>
          {depositMsg && (
            <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${depositMsg.kind === "ok" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>
              {depositMsg.text}
            </p>
          )}
          <button
            onClick={() => {
              const error = onDeposit(txId, Math.floor(amount));
              if (error) {
                setDepositMsg({ kind: "err", text: error });
              } else {
                setDepositMsg({ kind: "ok", text: "Deposit request sent to admin for verification. Credits appear in your real wallet after approval." });
                setTxId("");
              }
            }}
            className="mt-4 w-full rounded-2xl bg-cyan-300 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white"
          >
            Submit for admin verification
          </button>

          <div className="mt-6 space-y-3">
            {deposits.slice(0, 5).map((deposit) => (
              <div key={deposit.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm text-white">{deposit.transactionId}</p>
                  <p className="mt-1 text-sm text-slate-400">{formatCredits(deposit.amount)} · {timeAgo(deposit.createdAt)}</p>
                </div>
                <StatusBadge label={deposit.status} classes={getRequestStatusClasses(deposit.status)} />
              </div>
            ))}
          </div>
        </section>

        {/* Withdraw */}
        <section className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
          <div className="flex items-center gap-3">
            <Landmark className="h-7 w-7 text-emerald-200" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">Withdraw demo credits</p>
              <h2 className="text-3xl font-black tracking-[-0.06em]">Bank payout</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Bank name">
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClasses} placeholder="e.g. HDFC Bank" />
            </Field>
            <Field label="Account holder name">
              <input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className={inputClasses} placeholder="As per bank records" />
            </Field>
            <Field label="Account number">
              <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))} className={`${inputClasses} font-mono`} placeholder="XXXXXXXXXXXX" />
            </Field>
            <Field label="IFSC code">
              <input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} className={`${inputClasses} font-mono`} placeholder="HDFC0001234" />
            </Field>
            <div className="sm:col-span-2">
              <Field label={`Amount to withdraw (min ${MIN_WITHDRAW}, available ${formatCredits(user.realWallet)})`}>
                <input type="number" min={MIN_WITHDRAW} max={user.realWallet} value={wAmount} onChange={(e) => setWAmount(Number(e.target.value))} className={inputClasses} />
              </Field>
            </div>
          </div>
          {withdrawMsg && (
            <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${withdrawMsg.kind === "ok" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>
              {withdrawMsg.text}
            </p>
          )}
          <button
            onClick={() => {
              const error = onWithdraw({ amount: Math.floor(wAmount), bankName, accountHolder, accountNumber, ifsc });
              if (error) {
                setWithdrawMsg({ kind: "err", text: error });
              } else {
                setWithdrawMsg({ kind: "ok", text: "Withdrawal request sent. The amount is on hold and will be paid out once the admin verifies your bank details." });
              }
            }}
            className="mt-4 w-full rounded-2xl bg-emerald-300 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white"
          >
            Request withdrawal
          </button>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            The requested amount is held from your real-credit balance immediately to prevent double spending. If the admin rejects the request, the hold is refunded instantly.
          </p>

          <div className="mt-6 space-y-3">
            {withdrawals.slice(0, 5).map((withdrawal) => (
              <div key={withdrawal.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm text-white">{withdrawal.bankName} ····{withdrawal.accountNumber.slice(-4)}</p>
                  <p className="mt-1 text-sm text-slate-400">{formatCredits(withdrawal.amount)} · {timeAgo(withdrawal.createdAt)}</p>
                </div>
                <StatusBadge label={withdrawal.status} classes={getRequestStatusClasses(withdrawal.status)} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Talk to an agent                                                    */
/* ------------------------------------------------------------------ */

type ChatMessage = { from: "bot" | "user"; text: string };

function SupportPanel({
  tickets,
  onTicket,
}: {
  tickets: SupportTicket[];
  onTicket: (topic: string, message: string, transactionId?: string, screenshot?: string, screenshotName?: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "bot", text: `Hi! I'm the ${BRAND} assistant. I can help with deposit problems instantly. What went wrong?` },
  ]);
  const [stage, setStage] = useState<"topic" | "details" | "done">("topic");
  const [topic, setTopic] = useState("");
  const [txId, setTxId] = useState("");
  const [note, setNote] = useState("");
  const [screenshot, setScreenshot] = useState<string | undefined>();
  const [screenshotName, setScreenshotName] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  const pickTopic = (selected: string) => {
    setTopic(selected);
    setMessages((prev) => [
      ...prev,
      { from: "user", text: selected },
      {
        from: "bot",
        text: "Got it. To verify your payment, please upload the transaction ID and (optionally) a screenshot of the payment. This goes directly to the admin panel for manual verification.",
      },
    ]);
    setStage("details");
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      setMessages((prev) => [...prev, { from: "bot", text: "That screenshot is larger than 1.5 MB. Please upload a smaller image." }]);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(String(reader.result));
      setScreenshotName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!txId.trim()) {
      setMessages((prev) => [...prev, { from: "bot", text: "A transaction ID is required so the admin can locate your payment." }]);
      return;
    }
    onTicket(topic, note.trim() || "Deposit issue reported via agent chat.", txId.trim().toUpperCase(), screenshot, screenshotName);
    setMessages((prev) => [
      ...prev,
      { from: "user", text: `Transaction ID: ${txId.trim().toUpperCase()}${screenshotName ? ` · Screenshot: ${screenshotName}` : ""}` },
      {
        from: "bot",
        text: "Thank you! Your ticket has been sent straight to the admin panel. You'll see your real-credit wallet update as soon as the admin verifies the payment.",
      },
    ]);
    setStage("done");
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <SectionCard className="flex flex-col">
        <div className="flex items-center gap-3">
          <Headset className="h-7 w-7 text-cyan-200" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Talk to an agent</p>
            <h2 className="text-3xl font-black tracking-[-0.06em]">Deposit support</h2>
          </div>
        </div>

        <div className="mt-5 flex-1 space-y-3 overflow-y-auto rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.from === "user" ? "bg-cyan-300 text-slate-950" : "border border-white/10 bg-white/[0.05] text-slate-200"}`}>
                {message.from === "bot" && <Bot className="mb-1 h-4 w-4 text-cyan-200" />}
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {stage === "topic" && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {["My deposit is not credited", "I paid but forgot the transaction ID", `Paid less than minimum ${MIN_DEPOSIT} by mistake`, "Other deposit problem"].map((option) => (
              <button key={option} onClick={() => pickTopic(option)} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/[0.06] px-4 py-3 text-left text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15">
                {option}
              </button>
            ))}
          </div>
        )}

        {stage === "details" && (
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={txId} onChange={(e) => setTxId(e.target.value)} className={`${inputClasses} font-mono`} placeholder="Transaction ID (required)" />
              <button onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-300/40 hover:text-white">
                {screenshotName ? <Paperclip className="h-4 w-4 text-emerald-200" /> : <ImagePlus className="h-4 w-4" />}
                {screenshotName ? screenshotName : "Upload payment screenshot"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
            {screenshot && <img src={screenshot} alt="Payment screenshot preview" className="max-h-44 rounded-2xl border border-white/10 object-contain" />}
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={inputClasses} placeholder="Anything else the admin should know? (optional)" />
            <button onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white">
              <Send className="h-4 w-4" /> Send to admin panel
            </button>
          </div>
        )}

        {stage === "done" && (
          <button
            onClick={() => {
              setStage("topic");
              setTopic("");
              setTxId("");
              setNote("");
              setScreenshot(undefined);
              setScreenshotName(undefined);
              setMessages([{ from: "bot", text: "Hi again! What else can I help you with?" }]);
            }}
            className="mt-4 w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/40 hover:text-white"
          >
            Start a new conversation
          </button>
        )}
      </SectionCard>

      <SectionCard>
        <h3 className="text-xl font-bold">Your support tickets</h3>
        <div className="mt-4 space-y-3">
          {tickets.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No tickets yet. Use the agent chat to report a deposit problem.</p>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-white">{ticket.topic}</p>
                  <StatusBadge label={ticket.status} classes={getRequestStatusClasses(ticket.status)} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{ticket.message}</p>
                {ticket.transactionId && <p className="mt-2 font-mono text-sm text-cyan-100">TX: {ticket.transactionId}</p>}
                <p className="mt-2 text-xs text-slate-500">{timeAgo(ticket.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

function ProfilePanel({
  user,
  bets,
  onChangePassword,
}: {
  user: UserProfile;
  bets: Bet[];
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
}) {
  const stats = useMemo(() => {
    const won = bets.filter((bet) => bet.status === "won");
    const lost = bets.filter((bet) => bet.status === "lost");
    const pending = bets.filter((bet) => bet.status === "pending");
    const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const totalWinnings = bets.reduce((sum, bet) => sum + (bet.payout ?? 0), 0);
    const biggestWin = won.reduce((max, bet) => Math.max(max, bet.payout ?? 0), 0);
    const winRate = won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
    return { won: won.length, lost: lost.length, pending: pending.length, totalStaked, totalWinnings, biggestWin, winRate };
  }, [bets]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-5">
        {/* General */}
        <SectionCard>
          <div className="flex items-center gap-3">
            <UserCircle2 className="h-7 w-7 text-cyan-200" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">General</p>
              <h2 className="text-3xl font-black tracking-[-0.06em]">Your account</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <InfoStrip label="Unique User ID" value={user.userId} />
            <InfoStrip label="Full name" value={user.name} />
            <InfoStrip label="Phone" value={user.phone || "—"} />
            <InfoStrip label="Member since" value={new Date(user.createdAt).toLocaleDateString()} />
            <InfoStrip label="Account status" value="Verified · OTP" />
            <InfoStrip label="Demo wallet" value={formatCredits(user.wallet)} />
            <InfoStrip label="My balance" value={formatCredits(user.realWallet)} />
          </div>
        </SectionCard>

        {/* All-time stats */}
        <SectionCard>
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-amber-200" />
            <h3 className="text-xl font-bold">All-time bets &amp; winnings</h3>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoStrip label="Total bets" value={String(bets.length)} />
            <InfoStrip label="Wins" value={String(stats.won)} />
            <InfoStrip label="Losses" value={String(stats.lost)} />
            <InfoStrip label="Pending" value={String(stats.pending)} />
            <InfoStrip label="Win rate" value={`${stats.winRate}%`} />
            <InfoStrip label="Biggest win" value={formatCredits(stats.biggestWin)} />
            <InfoStrip label="Total staked" value={formatCredits(stats.totalStaked)} />
            <InfoStrip label="Total winnings" value={formatCredits(stats.totalWinnings)} />
            <InfoStrip label="Net result" value={formatCredits(stats.totalWinnings - stats.totalStaked)} />
          </div>
        </SectionCard>
      </div>

      {/* Security */}
      <SectionCard>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-emerald-200" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">Security</p>
            <h2 className="text-3xl font-black tracking-[-0.06em]">Change password</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Your password is stored only as a salted SHA-256 hash. After 5 wrong login attempts your account locks for 5 minutes to block brute-force attacks.
        </p>
        <div className="mt-6">
          <PasswordChangeForm accent="cyan" onChangePassword={onChangePassword} />
        </div>
      </SectionCard>
    </div>
  );
}
