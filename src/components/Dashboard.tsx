// MARKET 90XX - Dashboard.tsx - 91 Club Mobile UI Reskin with Referral System

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  Bot,
  CheckCircle2,
  Gauge,
  Gift,
  Headset,
  ImagePlus,
  Landmark,
  LockKeyhole,
  Paperclip,
  QrCode,
  Send,
  Share2,
  ShieldCheck,
  TimerReset,
  Trophy,
  UserCircle2,
  Users,
  WalletCards,
  XCircle,
  Copy,
} from "lucide-react";

import {
  BRAND,
  DOUBLE_MULTIPLIER,
  MAX_DOUBLE_BET,
  MIN_DEPOSIT,
  MIN_REFERRAL_CLAIM,
  MIN_WITHDRAW,
  REFERRAL_BONUS,
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
  ReferralClaim,
  SplitSide,
  SupportTicket,
  UserProfile,
  WithdrawRequest,
} from "@/lib/types";

import { Field, InfoStrip, PasswordChangeForm, SectionCard, StatusBadge, inputClasses } from "@/components/ui";


function safeTimeAgo(date: Date | string | number | undefined | null): string {
  if (!date) return "Just now";
  try {
    if (typeof date === "number") return timeAgo(new Date(date).toISOString());
    if (typeof date === "string") return timeAgo(date);
    return timeAgo(date.toISOString());
  } catch (e) {
    return "Just now";
  }
}

export type UserTab = MarketId | "bets" | "wallet" | "support" | "profile" | "referral";

function safeNumber(value: string | number, fallback = 0): number {
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

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
  referralClaims,
  allUsers,
  activeTab,
  onTabChange,
  onLogout,
  onPlaceBet,
  onDeposit,
  onWithdraw,
  onTicket,
  onClaimReferral,
  onChangePassword,
}: {
  user: UserProfile;
  markets: Market[];
  bets: Bet[];
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  tickets: SupportTicket[];
  referralClaims: ReferralClaim[];
  allUsers: UserProfile[];
  activeTab: UserTab;
  onTabChange: (tab: UserTab) => void;
  onLogout: () => void;
  onPlaceBet: (market: Market, mode: BetMode, selection: string, stake: number, splitSide?: SplitSide) => string | null;
  onDeposit: (transactionId: string, amount: number) => string | null;
  onWithdraw: (form: WithdrawForm) => string | null;
  onTicket: (topic: string, message: string, transactionId?: string, screenshot?: string, screenshotName?: string) => void;
  onClaimReferral: () => string | null;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
}) {
  const activeMarket = markets.find((market) => market?.id === activeTab);

  const currentView = 
    activeMarket ? "home" :
    activeTab === "bets" ? "history" :
    activeTab === "wallet" ? "wallet" :
    activeTab === "support" ? "support" :
    activeTab === "referral" ? "referral" :
    activeTab === "profile" ? "account" : "home";

  const goView = (v: "home"|"history"|"wallet"|"support"|"account"|"referral") => {
    if (v === "home") onTabChange(markets[0]?.id || "hsi");
    if (v === "history") onTabChange("bets");
    if (v === "wallet") onTabChange("wallet");
    if (v === "support") onTabChange("support");
    if (v === "account") onTabChange("profile");
    if (v === "referral") onTabChange("referral");
  };

  return (
    <div className="min-h-screen bg-[#e8e8e8] flex justify-center text-slate-900">
      <div className="w-full max-w-[420px] bg-[#f5f5f7] min-h-screen relative pb-[76px] shadow-2xl">
        
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="font-black text-[18px] tracking-wide text-slate-900">
            MARKET <span className="text-[#e53935]">90XX</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 text-[11px] leading-tight">
              <div className="text-slate-500">Wallet</div>
              <div className="font-bold text-slate-900">{formatCredits(Number(user?.wallet) || 0)}</div>
            </div>
            <button
              onClick={() => goView("wallet")}
              className="bg-[#e53935] text-white rounded-full px-3.5 py-2 text-[13px] font-bold"
            >
              + Deposit
            </button>
          </div>
        </header>

        {currentView === "home" && markets.length > 0 && (
          <div className="sticky top-[64px] z-25 bg-white border-b border-slate-200 overflow-x-auto">
            <div className="flex gap-2 px-3.5 py-2 whitespace-nowrap">
              {markets.map((market) => {
                if (!market || !market.id) return null;
                return (
                  <button
                    key={market.id}
                    onClick={() => onTabChange(market.id as MarketId)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${
                      activeTab === market.id
                        ? "bg-[#e53935] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {market.name || "Market"}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <main className="px-3.5 py-3.5">
          {activeMarket ? (
            <div className="bg-white rounded-[18px] p-3 shadow-sm border border-slate-200">
              <MarketPanel market={activeMarket} bets={bets} wallet={Number(user?.wallet) || 0} onPlaceBet={onPlaceBet} />
            </div>
          ) : activeTab === "bets" ? (
            <BetsPanel bets={bets} markets={markets} />
          ) : activeTab === "wallet" ? (
            <WalletPanel user={user} deposits={deposits} withdrawals={withdrawals} onDeposit={onDeposit} onWithdraw={onWithdraw} />
          ) : activeTab === "referral" ? (
            <ReferralPanel 
              user={user} 
              allUsers={allUsers}
              referralClaims={referralClaims}
              onClaimReferral={onClaimReferral}
            />
          ) : activeTab === "profile" ? (
            <ProfilePanel 
              user={user} 
              bets={bets} 
              deposits={deposits}
              withdrawals={withdrawals}
              onChangePassword={onChangePassword}
              onLogout={onLogout}
              goWallet={() => goView("wallet")}
              goHistory={() => goView("history")}
              goSupport={() => goView("support")}
              goReferral={() => goView("referral")}
            />
          ) : (
            <SupportPanel tickets={tickets} onTicket={onTicket} />
          )}
        </main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-white border-t border-slate-200 grid grid-cols-5 px-1 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] z-40">
          <BottomBtn active={currentView==="home"} onClick={()=>goView("home")} icon="🏠" label="Home" />
          <BottomBtn active={currentView==="history"} onClick={()=>goView("history")} icon="📋" label="History" />
          <BottomBtn active={currentView==="wallet"} onClick={()=>goView("wallet")} icon="💰" label="Wallet" />
          <BottomBtn active={currentView==="referral"} onClick={()=>goView("referral")} icon="🎁" label="Refer" />
          <BottomBtn active={currentView==="account" || currentView==="support"} onClick={()=>goView("account")} icon="👤" label="Account" />
        </nav>
      </div>
    </div>
  );
}

function BottomBtn({ active, onClick, icon, label }: { active: boolean; onClick: ()=>void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-semibold transition ${active ? "text-[#e53935]" : "text-slate-500"}`}
    >
      <span className="text-[18px]">{icon}</span>
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* REFERRAL PANEL - NEW                                               */
/* ------------------------------------------------------------------ */

function ReferralPanel({
  user,
  allUsers,
  referralClaims,
  onClaimReferral,
}: {
  user: UserProfile;
  allUsers: UserProfile[];
  referralClaims: ReferralClaim[];
  onClaimReferral: () => string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [claimMsg, setClaimMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const referralCode = user?.referralCode || "LOADING";
  const referralLink = `${window.location.origin}?ref=${referralCode}`;
  const pendingEarnings = user?.pendingReferralEarnings || 0;
  const totalEarnings = user?.referralEarnings || 0;
  const referralCount = user?.referralCount || 0;

  // Find users referred by current user
  const myReferrals = useMemo(() => {
    return allUsers.filter(u => u.referredBy === user.userId);
  }, [allUsers, user.userId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const message = `🎯 Hey! Join me on MARKET 90XX - the best decimal close gaming platform!\n\n💰 Win up to 90x your bet\n🎁 Use my referral code: *${referralCode}*\n\n👉 Join here: ${referralLink}\n\nLet's win together! 🚀`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MARKET 90XX",
          text: `Join me on MARKET 90XX! Use my referral code: ${referralCode}`,
          url: referralLink,
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      handleWhatsAppShare();
    }
  };

  const handleClaim = () => {
    const error = onClaimReferral();
    if (error) {
      setClaimMsg({ kind: "err", text: error });
    } else {
      setClaimMsg({ kind: "ok", text: `Claim of ₹${pendingEarnings} submitted! Admin will approve soon.` });
    }
    setTimeout(() => setClaimMsg(null), 5000);
  };

  const hasPendingClaim = referralClaims.some(c => c.status === "pending");

  return (
    <div className="space-y-3 -mx-3.5 -mt-3.5">
      {/* Red header */}
      <div className="bg-gradient-to-br from-[#ff5a4a] to-[#e53935] text-white px-4 pt-5 pb-8">
        <div className="text-center">
          <Gift className="h-12 w-12 mx-auto mb-2" />
          <h1 className="text-[24px] font-black">Earn ₹50 per friend!</h1>
          <p className="text-white/90 text-sm mt-1">Share your code and earn instantly</p>
        </div>
      </div>

      <div className="px-3.5 space-y-3 -mt-4 relative">
        {/* Earnings Stats */}
        <div className="bg-white rounded-[18px] p-4 shadow-sm border border-slate-200">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[11px] text-slate-500 uppercase">Friends Joined</div>
              <div className="text-[24px] font-black text-slate-900">{referralCount}</div>
            </div>
            <div className="border-l border-r border-slate-200">
              <div className="text-[11px] text-slate-500 uppercase">Pending</div>
              <div className="text-[24px] font-black text-amber-600">₹{pendingEarnings}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase">Earned</div>
              <div className="text-[24px] font-black text-emerald-600">₹{totalEarnings}</div>
            </div>
          </div>
        </div>

        {/* Your Referral Code */}
        <div className="bg-white rounded-[18px] p-4 shadow-sm border border-slate-200">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Your Referral Code</div>
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-dashed border-[#e53935] rounded-2xl p-4 text-center">
            <div className="font-mono font-black text-[28px] text-[#e53935] tracking-widest">
              {referralCode}
            </div>
            <button
              onClick={() => handleCopy(referralCode)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#e53935]"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied!" : "Tap to copy"}
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl px-4 py-3.5 font-black text-sm hover:bg-[#1ea951] transition"
            >
              <Share2 className="h-4 w-4" />
              Share on WhatsApp
            </button>
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-800 rounded-xl px-4 py-3 font-bold text-sm hover:bg-slate-200 transition"
            >
              <Share2 className="h-4 w-4" />
              More share options
            </button>
            <button
              onClick={() => handleCopy(referralLink)}
              className="w-full flex items-center justify-center gap-2 border border-slate-300 rounded-xl px-4 py-3 font-semibold text-sm text-slate-700"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Link Copied!" : "Copy referral link"}
            </button>
          </div>
        </div>

        {/* Claim Section */}
        <div className="bg-white rounded-[18px] p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <WalletCards className="h-5 w-5 text-[#e53935]" />
            <h3 className="font-black text-slate-900">Claim Earnings</h3>
          </div>
          <p className="text-sm text-slate-600">
            Minimum claim: <b>₹{MIN_REFERRAL_CLAIM}</b>. Admin will verify and credit to your wallet.
          </p>
          
          {claimMsg && (
            <p className={`mt-3 rounded-xl px-3 py-2 text-sm ${
              claimMsg.kind === "ok" 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {claimMsg.text}
            </p>
          )}

          <button
            onClick={handleClaim}
            disabled={pendingEarnings < MIN_REFERRAL_CLAIM || hasPendingClaim}
            className="mt-3 w-full bg-[#e53935] text-white rounded-xl px-4 py-3.5 font-black text-sm disabled:bg-slate-300 disabled:text-slate-500"
          >
            {hasPendingClaim 
              ? "Claim pending approval..." 
              : pendingEarnings < MIN_REFERRAL_CLAIM
                ? `Need ₹${MIN_REFERRAL_CLAIM - pendingEarnings} more to claim`
                : `Claim ₹${pendingEarnings} now`}
          </button>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-[18px] p-4 shadow-sm border border-slate-200">
          <h3 className="font-black text-slate-900 mb-3">How it works</h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-red-100 text-[#e53935] flex items-center justify-center font-black text-sm">1</div>
              <div className="flex-1 pt-1">Share your code with friends</div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-red-100 text-[#e53935] flex items-center justify-center font-black text-sm">2</div>
              <div className="flex-1 pt-1">They sign up using your code</div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-red-100 text-[#e53935] flex items-center justify-center font-black text-sm">3</div>
              <div className="flex-1 pt-1">You earn <b className="text-[#e53935]">₹{REFERRAL_BONUS}</b> instantly</div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-red-100 text-[#e53935] flex items-center justify-center font-black text-sm">4</div>
              <div className="flex-1 pt-1">Claim when you reach ₹{MIN_REFERRAL_CLAIM}</div>
            </div>
          </div>
        </div>

        {/* My Referrals List */}
        {myReferrals.length > 0 && (
          <div className="bg-white rounded-[18px] p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-[#e53935]" />
              <h3 className="font-black text-slate-900">My Referrals ({myReferrals.length})</h3>
            </div>
            <div className="space-y-2">
              {myReferrals.map(referredUser => (
                <div key={referredUser.userId} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{referredUser.name}</div>
                    <div className="text-xs text-slate-500">Joined {safeTimeAgo(referredUser.createdAt)}</div>
                  </div>
                  <div className="text-[#e53935] font-black text-sm">+₹{REFERRAL_BONUS}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claims History */}
        {referralClaims.length > 0 && (
          <div className="bg-white rounded-[18px] p-4 shadow-sm border border-slate-200">
            <h3 className="font-black text-slate-900 mb-3">Claim History</h3>
            <div className="space-y-2">
              {referralClaims.map(claim => (
                <div key={claim.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">₹{claim.amount}</div>
                    <div className="text-xs text-slate-500">{safeTimeAgo(claim.createdAt)}</div>
                  </div>
                  <div className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                    claim.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                    claim.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {claim.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

  const { marketBets, pendingMarketBets, marketPendingStake } = useMemo(() => {
    const mBets = bets.filter((bet) => bet && bet.marketId === market?.id);
    const pending = mBets.filter((bet) => bet?.status === "pending");
    return {
      marketBets: mBets,
      pendingMarketBets: pending,
      marketPendingStake: pending.reduce((sum, bet) => {
        const stake = Number(bet?.stake);
        return sum + (Number.isFinite(stake) ? stake : 0);
      }, 0),
    };
  }, [bets, market?.id]);

  const bettingOpen = isBettingOpen(market, now);
  const countdown = timeUntilCutoff(market, now);

  if (!market) {
    return <div className="p-4 text-red-500">Error: Market data not available</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-slate-500">{market?.symbol || "N/A"}</p>
        <h2 className="text-[24px] font-black text-slate-900">{market?.name || "Unknown Market"}</h2>
        <p className="text-sm text-slate-500">
          {market?.country || "Unknown"} close: {market?.closeTime || "N/A"} {market?.timezone || ""}
        </p>
        <div className="mt-2">
          <StatusBadge
            label={market?.status === "open" ? "betting open" : market?.status === "locked" ? "locked by admin" : "settled"}
            classes={getMarketStatusClasses(market?.status || "settled")}
          />
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-2 rounded-2xl border p-3 text-center ${bettingOpen ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
        <div>
          <p className="text-[10px] uppercase text-slate-500">Time</p>
          <p className="font-mono text-[15px] font-bold text-slate-900">
            {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-slate-500">Closes</p>
          <p className="font-mono text-[15px] font-bold text-amber-700">{market?.cutoffLabel || "N/A"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-slate-500">Left</p>
          <p className="font-mono text-[15px] font-bold text-slate-900">
            {market?.status === "locked" ? "LOCKED" : bettingOpen ? countdown : "CLOSED"}
          </p>
        </div>
      </div>

      <BettingWidget market={market} wallet={wallet} onPlaceBet={onPlaceBet} />

      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-slate-500">History</p>
        <div className="flex flex-wrap gap-2">
          {market?.history && Array.isArray(market.history) && market.history.length > 0 ? (
            market.history.map((digit, index) => (
              <span key={`${digit}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-bold text-slate-800">
                .{digit}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-500">No history</p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-widest text-slate-500 font-bold">My bets in {market?.name}</p>
        <div className="space-y-2">
          {bets.filter(b => b?.marketId === market?.id).length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">No bets placed on this market yet.</p>
          ) : (
            bets
              .filter(b => b?.marketId === market?.id)
              .map((bet) => {
                if (!bet || !bet.id) return null;
                return <BetRow key={bet.id} bet={bet} />;
              })
          )}
        </div>
      </div>
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
  const safeStake = safeNumber(stake, 0);
  const overMax = mode === "double" && safeStake > MAX_DOUBLE_BET;
  const potential = safeStake * multiplier;
  const disabled = !bettingOpen || safeStake <= 0 || wallet < safeStake || overMax;

  useEffect(() => {
    if (feedback?.kind === "ok") {
      const timer = window.setTimeout(() => setFeedback(null), 5000);
      return () => window.clearTimeout(timer);
    }
  }, [feedback]);

  const handlePlaceBet = () => {
    const error = onPlaceBet(market, mode, selection, safeStake, mode === "split" ? splitSide : undefined);
    setFeedback(
      error
        ? { kind: "err", text: error }
        : {
            kind: "ok",
            text: `Bet placed on ${mode === "double" ? selection : `${splitSide} ${selection}`} — potential return ${formatCredits(potential)}.`,
          },
    );
  };

  return (
    <section className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-[18px] font-black">Pick number</h3>
        <div className="flex rounded-full border border-slate-200 bg-white p-1 text-[12px] font-bold">
          <button
            type="button"
            onClick={() => { setMode("double"); setFeedback(null); }}
            className={`rounded-full px-3 py-1.5 transition ${mode === "double" ? "bg-[#e53935] text-white" : "text-slate-600"}`}
          >
            00-99 · {DOUBLE_MULTIPLIER}x
          </button>
          <button
            type="button"
            onClick={() => { setMode("split"); setFeedback(null); }}
            className={`rounded-full px-3 py-1.5 transition ${mode === "split" ? "bg-[#e53935] text-white" : "text-slate-600"}`}
          >
            A/B · {SPLIT_MULTIPLIER}x
          </button>
        </div>
      </div>

      {mode === "double" ? (
        <div className="grid grid-cols-5 gap-2 max-h-[260px] overflow-y-auto pr-1">
          {Array.from({ length: 100 }, (_, index) => index.toString().padStart(2, "0")).map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => setDoubleSelection(digit)}
              className={`aspect-square rounded-xl border text-sm font-black transition ${
                doubleSelection === digit
                  ? "border-[#e53935] bg-[#e53935] text-white shadow"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#e53935]/40"
              }`}
            >
              {digit}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2">
          <DigitColumn
            title="Andar"
            subtitle="Tens"
            selected={andarSelection}
            active={splitSide === "Andar"}
            onActivate={() => setSplitSide("Andar")}
            onSelect={setAndarSelection}
          />
          <DigitColumn
            title="Bahar"
            subtitle="Ones"
            selected={baharSelection}
            active={splitSide === "Bahar"}
            onActivate={() => setSplitSide("Bahar")}
            onSelect={setBaharSelection}
          />
        </div>
      )}

      <div className="mt-3 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3">
        <label>
          <span className="mb-1 block text-[11px] uppercase tracking-widest text-slate-500">
            Stake{mode === "double" ? ` · max ${MAX_DOUBLE_BET}` : ""}
          </span>
          <input
            type="number"
            min={1}
            max={mode === "double" ? MAX_DOUBLE_BET : undefined}
            value={stake}
            onChange={(event) => setStake(safeNumber(event.target.value, 0))}
            className={`w-full rounded-xl border bg-white px-3 py-3 font-mono text-lg font-bold outline-none focus:border-[#e53935] ${overMax ? "border-red-400" : "border-slate-300"}`}
            disabled={!bettingOpen}
          />
          {overMax && (
            <span className="mt-1 block text-xs font-semibold text-red-600">
              Max bet on double is {MAX_DOUBLE_BET} credits.
            </span>
          )}
        </label>
        <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
          <SlipMetric label="Pick" value={mode === "double" ? selection : `${splitSide[0]}${selection}`} />
          <SlipMetric label="X" value={`${multiplier}x`} />
          <SlipMetric label="Win" value={formatCredits(potential)} />
          <SlipMetric label="Bal" value={formatCredits(wallet)} />
        </div>
      </div>

      {feedback && (
        <p
          role={feedback.kind === "err" ? "alert" : "status"}
          className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
            feedback.kind === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={handlePlaceBet}
        className="mt-3 w-full rounded-xl bg-[#e53935] px-4 py-3.5 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#c62828] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
      >
        {!bettingOpen
          ? market.status === "locked"
            ? "Betting locked"
            : `Closed — ${market.cutoffLabel}`
          : overMax
            ? `Max ${MAX_DOUBLE_BET}`
            : wallet < safeStake
              ? "Low balance"
              : safeStake <= 0
                ? "Enter stake"
                : "Place bet"}
      </button>
      <p className="mt-2 text-center text-[11px] text-slate-500">
        {bettingOpen ? `Closes at ${market.cutoffLabel} sharp — ${countdown} left.` : "Betting closed."}
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
    <div className={`rounded-2xl border p-3 transition ${active ? "border-[#e53935]/40 bg-red-50" : "border-slate-200 bg-white"}`}>
      <button type="button" onClick={onActivate} className="mb-2 text-left">
        <h4 className="font-black">{title}</h4>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </button>
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: 10 }, (_, index) => String(index)).map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => { onActivate(); onSelect(digit); }}
            className={`aspect-square rounded-lg border font-black text-sm transition ${
              selected === digit && active
                ? "border-[#e53935] bg-[#e53935] text-white"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-[#e53935]/40"
            }`}
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
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 truncate font-mono text-[13px] font-black text-slate-900">{value}</p>
    </div>
  );
}

function BetsPanel({ bets, markets }: { bets: Bet[]; markets: Market[] }) {
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);

  const analytics = useMemo(() => {
    const won = bets.filter((bet) => bet?.status === "won").length;
    const lost = bets.filter((bet) => bet?.status === "lost").length;
    const staked = bets.reduce((sum, bet) => sum + (Number(bet?.stake) || 0), 0);
    const paid = bets.reduce((sum, bet) => sum + (Number(bet?.payout) || 0), 0);
    return { won, lost, staked, paid };
  }, [bets]);

  const betsByMarket = useMemo(() => {
    const grouped: { [key: string]: Bet[] } = {};
    bets.forEach(bet => {
      if (bet?.marketId) {
        if (!grouped[bet.marketId]) grouped[bet.marketId] = [];
        grouped[bet.marketId].push(bet);
      }
    });
    return grouped;
  }, [bets]);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-[18px] p-4 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black">My Bets</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200"><div className="text-slate-500 text-xs">Total</div><div className="font-bold">{bets.length}</div></div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200"><div className="text-slate-500 text-xs">Wins</div><div className="font-bold">{analytics.won}</div></div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200"><div className="text-slate-500 text-xs">Losses</div><div className="font-bold">{analytics.lost}</div></div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200"><div className="text-slate-500 text-xs">Net</div><div className="font-bold">{formatCredits(analytics.paid - analytics.staked)}</div></div>
        </div>
      </div>

      <div className="space-y-2">
        {bets.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">No bets yet.</p>
        ) : (
          markets.map(market => {
            const marketBets = betsByMarket[market?.id] || [];
            if (marketBets.length === 0) return null;
            return (
              <div key={market?.id} className="bg-white rounded-[18px] border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedMarket(expandedMarket === market?.id ? null : market?.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition border-b border-slate-200"
                >
                  <div className="text-left">
                    <div className="font-bold text-slate-900">{market?.name || "Unknown Market"}</div>
                    <div className="text-xs text-slate-500">{marketBets.length} bet{marketBets.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-2xl transition-transform" style={{ transform: expandedMarket === market?.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</div>
                </button>
                {expandedMarket === market?.id && (
                  <div className="p-4 space-y-2 bg-slate-50">
                    {marketBets.map((bet) => {
                      if (!bet || !bet.id) return null;
                      return <BetRow key={bet.id} bet={bet} />;
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function BetRow({ bet, showUser = false }: { bet: Bet; showUser?: boolean }) {
  const statusIcon =
    bet.status === "won" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
    : bet.status === "lost" ? <XCircle className="h-5 w-5 shrink-0 text-red-500" />
    : bet.status === "refunded" ? <XCircle className="h-5 w-5 shrink-0 text-slate-400" />
    : <TimerReset className="h-5 w-5 shrink-0 text-amber-500" />;

  const modeLabel = bet.mode === "double" ? "Double" : (bet.splitSide ?? "Split");
  const safeStake = Number(bet?.stake) || 0;
  const safePlacedAt = bet?.placedAt || Date.now();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        {statusIcon}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-900">
            {bet.marketName || "Unknown Market"}
            {showUser && <span className="ml-2 font-mono text-xs font-normal text-[#e53935]">{bet.userId}</span>}
          </p>
          <p className="truncate text-sm text-slate-500">{modeLabel} · {bet.selection} · {safeTimeAgo(safePlacedAt)}</p>
        </div>
        <div className="text-right text-sm">
          <div className="font-mono text-slate-700">₹{safeStake}</div>
          <div className="text-[11px] uppercase font-bold text-slate-500">{bet.status || "pending"}</div>
        </div>
      </div>
    </div>
  );
}

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
  const [amount, setAmount] = useState<number>(MIN_DEPOSIT);
  const [depositMsg, setDepositMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [wAmount, setWAmount] = useState<number>(MIN_WITHDRAW);
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [withdrawMsg, setWithdrawMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const pendingDeposits = deposits.filter((d) => d?.status === "pending").length;
  const pendingWithdrawals = withdrawals.filter((w) => w?.status === "pending").length;

  useEffect(() => {
    if (depositMsg?.kind === "ok") {
      const timer = window.setTimeout(() => setDepositMsg(null), 6000);
      return () => window.clearTimeout(timer);
    }
  }, [depositMsg]);

  useEffect(() => {
    if (withdrawMsg?.kind === "ok") {
      const timer = window.setTimeout(() => setWithdrawMsg(null), 6000);
      return () => window.clearTimeout(timer);
    }
  }, [withdrawMsg]);

  const handleDeposit = () => {
    const trimmedTx = txId.trim();
    const safeAmount = Math.floor(safeNumber(String(amount), 0));
    if (!trimmedTx) { setDepositMsg({ kind: "err", text: "Transaction ID is required." }); return; }
    if (safeAmount < MIN_DEPOSIT) { setDepositMsg({ kind: "err", text: `Minimum deposit is ${MIN_DEPOSIT} credits.` }); return; }
    const error = onDeposit(trimmedTx, safeAmount);
    if (error) { setDepositMsg({ kind: "err", text: error }); }
    else {
      setDepositMsg({ kind: "ok", text: "Deposit request sent to admin for verification." });
      setTxId(""); setAmount(MIN_DEPOSIT);
    }
  };

  const handleWithdraw = () => {
    const safeAmount = Math.floor(safeNumber(String(wAmount), 0));
    if (safeAmount < MIN_WITHDRAW) { setWithdrawMsg({ kind: "err", text: `Minimum withdrawal is ${MIN_WITHDRAW} credits.` }); return; }
    if (safeAmount > (Number(user?.wallet) || 0)) { setWithdrawMsg({ kind: "err", text: "Amount exceeds available balance." }); return; }
    if (!bankName.trim() || !accountHolder.trim() || !accountNumber.trim() || !ifsc.trim()) { setWithdrawMsg({ kind: "err", text: "Please fill in all bank details." }); return; }
    const error = onWithdraw({
      amount: safeAmount,
      bankName: bankName.trim(),
      accountHolder: accountHolder.trim(),
      accountNumber: accountNumber.trim(),
      ifsc: ifsc.trim(),
    });
    if (error) { setWithdrawMsg({ kind: "err", text: error }); }
    else {
      setWithdrawMsg({ kind: "ok", text: "Withdrawal request sent. Amount held." });
      setWAmount(MIN_WITHDRAW); setBankName(""); setAccountHolder(""); setAccountNumber(""); setIfsc("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-[18px] p-4 border border-slate-200 shadow-sm">
        <div className="text-slate-500 text-sm">Total balance</div>
        <div className="text-[28px] font-black text-slate-900">{formatCredits(Number(user?.wallet) || 0)}</div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
          <div>Deposits<br/><b className="text-slate-800">{pendingDeposits} pending</b></div>
          <div>Withdraw<br/><b className="text-slate-800">{pendingWithdrawals} pending</b></div>
          <div>UID<br/><b className="text-slate-800">{user.userId}</b></div>
        </div>
      </div>

      <div className="bg-white rounded-[18px] p-4 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-black">Deposit</h2>
        <div className="mt-3 flex gap-3">
          <img src="/images/deposit-qr.png" alt="Deposit QR" className="h-28 w-28 rounded-xl border border-slate-200 bg-white object-cover" />
          <div className="text-sm text-slate-600">
            <p className="font-mono text-[#e53935]">Ref: {user?.userId || "N/A"}</p>
            <p className="mt-1">Min deposit {MIN_DEPOSIT} credits. Paste UPI TX ID below.</p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            {[100,300,500,1000].map(v => (
              <button key={v} type="button" onClick={()=>setAmount(v)} className={`px-3 py-1.5 rounded-full text-sm font-bold border ${amount===v ? "bg-red-50 border-[#e53935] text-[#e53935]" : "bg-slate-50 border-slate-200 text-slate-700"}`}>₹{v}</button>
            ))}
          </div>
          <input type="number" min={MIN_DEPOSIT} value={amount} onChange={(e)=>setAmount(safeNumber(e.target.value,0))} className="w-full rounded-xl border border-slate-300 px-3 py-3" placeholder="Amount" />
          <input value={txId} onChange={(e)=>setTxId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 font-mono" placeholder="UPI Transaction ID" autoComplete="off" />
          {depositMsg && (
            <p className={`rounded-xl px-3 py-2 text-sm ${depositMsg.kind==="ok" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>{depositMsg.text}</p>
          )}
          <button type="button" onClick={handleDeposit} className="w-full rounded-xl bg-[#e53935] px-4 py-3 text-sm font-black text-white">Submit Deposit</button>
        </div>
      </div>

      <div className="bg-white rounded-[18px] p-4 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-black">Withdraw</h2>
        <div className="mt-3 grid gap-2">
          <input value={bankName} onChange={(e)=>setBankName(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-3" placeholder="Bank name" />
          <input value={accountHolder} onChange={(e)=>setAccountHolder(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-3" placeholder="Account holder" />
          <input value={accountNumber} onChange={(e)=>setAccountNumber(e.target.value.replace(/\D/g,""))} className="rounded-xl border border-slate-300 px-3 py-3 font-mono" placeholder="Account number" inputMode="numeric" />
          <input value={ifsc} onChange={(e)=>setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""))} className="rounded-xl border border-slate-300 px-3 py-3 font-mono" placeholder="IFSC" maxLength={11} />
          <input type="number" min={MIN_WITHDRAW} max={Number(user?.wallet) || 0} value={wAmount} onChange={(e)=>setWAmount(safeNumber(e.target.value,0))} className="rounded-xl border border-slate-300 px-3 py-3" placeholder="Amount" />
          {withdrawMsg && (
            <p className={`rounded-xl px-3 py-2 text-sm ${withdrawMsg.kind==="ok" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>{withdrawMsg.text}</p>
          )}
          <button type="button" onClick={handleWithdraw} className="w-full rounded-xl bg-[#e53935] px-4 py-3 text-sm font-black text-white">Request Withdrawal</button>
          <p className="text-[11px] text-slate-500">Amount is held immediately. Refunded if rejected.</p>
        </div>
      </div>
    </div>
  );
}

type ChatMessage = { from: "bot" | "user"; text: string };

function SupportPanel({
  tickets,
  onTicket,
}: {
  tickets: SupportTicket[];
  onTicket: (topic: string, message: string, transactionId?: string, screenshot?: string, screenshotName?: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "bot", text: `Hi! I'm the ${BRAND} assistant. What went wrong?` },
  ]);
  const [stage, setStage] = useState<"topic" | "details" | "done">("topic");
  const [topic, setTopic] = useState("");
  const [txId, setTxId] = useState("");
  const [note, setNote] = useState("");
  const [screenshot, setScreenshot] = useState<string | undefined>();
  const [screenshotName, setScreenshotName] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (chatRef.current) { chatRef.current.scrollTop = chatRef.current.scrollHeight; } }, [messages]);

  const pickTopic = (selected: string) => {
    setTopic(selected);
    setMessages((prev) => [...prev, { from: "user", text: selected }, { from: "bot", text: "Upload your transaction ID and screenshot for verification." }]);
    setStage("details");
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setMessages((prev) => [...prev, { from: "bot", text: "Please upload an image file." }]); return; }
    if (file.size > 1.5 * 1024 * 1024) { setMessages((prev) => [...prev, { from: "bot", text: "Max 1.5 MB." }]); return; }
    const reader = new FileReader();
    reader.onload = () => { setScreenshot(String(reader.result)); setScreenshotName(file.name); setMessages((prev) => [...prev, { from: "bot", text: `Screenshot "${file.name}" uploaded.` }]); };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = () => {
    const trimmedTx = txId.trim().toUpperCase();
    if (!trimmedTx) { setMessages((prev) => [...prev, { from: "bot", text: "Transaction ID is required." }]); return; }
    onTicket(topic, note.trim() || "Deposit issue reported via agent chat.", trimmedTx, screenshot, screenshotName);
    setMessages((prev) => [...prev, { from: "user", text: `TX: ${trimmedTx}` }, { from: "bot", text: "Thank you! Ticket sent to admin." }]);
    setStage("done");
  };

  const resetConversation = () => {
    setStage("topic"); setTopic(""); setTxId(""); setNote(""); setScreenshot(undefined); setScreenshotName(undefined);
    if (fileRef.current) fileRef.current.value = "";
    setMessages([{ from: "bot", text: "Hi again! What else can I help with?" }]);
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-[18px] p-4 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-black">Talk to Agent</h2>
        <div ref={chatRef} className="mt-3 space-y-2 max-h-[320px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.from === "user" ? "bg-[#e53935] text-white" : "border border-slate-200 bg-white text-slate-800"}`}>
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {stage === "topic" && (
          <div className="mt-3 grid gap-2">
            {["My deposit is not credited","I paid but forgot the transaction ID",`Paid less than minimum ${MIN_DEPOSIT} by mistake`,"Other deposit problem"].map((option) => (
              <button key={option} type="button" onClick={() => pickTopic(option)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100">
                {option}
              </button>
            ))}
          </div>
        )}

        {stage === "details" && (
          <div className="mt-3 space-y-2">
            <input value={txId} onChange={(e) => setTxId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 font-mono" placeholder="Transaction ID" autoComplete="off" />
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold">
              {screenshotName ? "📎 " + screenshotName : "📷 Upload payment screenshot"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            {screenshot && <img src={screenshot} alt="preview" className="max-h-44 rounded-xl border border-slate-200 object-contain" />}
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="w-full rounded-xl border border-slate-300 px-3 py-3" placeholder="Anything else? (optional)" />
            <button type="button" onClick={submit} className="w-full rounded-xl bg-[#e53935] px-4 py-3 text-sm font-black text-white">Send to admin</button>
          </div>
        )}

        {stage === "done" && (
          <button type="button" onClick={resetConversation} className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold">Start new conversation</button>
        )}
      </div>

      <div className="bg-white rounded-[18px] p-4 border border-slate-200 shadow-sm">
        <h3 className="font-bold">Your tickets</h3>
        <div className="mt-3 space-y-2">
          {tickets.length === 0 ? (
            <p className="text-sm text-slate-500">No tickets yet.</p>
          ) : (
            tickets.map((ticket) => {
              if (!ticket || !ticket.id) return null;
              return (
                <div key={ticket.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">{ticket.topic || "Unknown"}</p>
                    <span className="text-xs text-slate-500">{ticket.status || "open"}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{ticket.message || "No message"}</p>
                  {ticket.transactionId && <p className="mt-1 font-mono text-sm text-[#e53935]">TX: {ticket.transactionId}</p>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({
  user,
  bets,
  deposits,
  withdrawals,
  onChangePassword,
  onLogout,
  goWallet,
  goHistory,
  goSupport,
  goReferral,
}: {
  user: UserProfile;
  bets: Bet[];
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
  onLogout: () => void;
  goWallet: () => void;
  goHistory: () => void;
  goSupport: () => void;
  goReferral: () => void;
}) {
  const [showSecurity, setShowSecurity] = useState(false);

  const stats = useMemo(() => {
    const won = bets.filter((bet) => bet?.status === "won");
    const lost = bets.filter((bet) => bet?.status === "lost");
    return { won: won.length, lost: lost.length, total: bets.length };
  }, [bets]);

  const avatarLetter = (user?.name || "U").slice(0,1).toUpperCase();

  return (
    <div className="space-y-3 -mx-3.5 -mt-3.5">
      <div className="bg-gradient-to-br from-[#ff5a4a] to-[#e53935] text-white px-4 pt-5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-[22px] font-black border-2 border-white/30">
            {avatarLetter}
          </div>
          <div>
            <div className="text-[18px] font-black">{user?.name || "Player"} <span className="ml-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-full">VIP0</span></div>
            <div className="text-[12px] text-white/90">UID | {user?.userId || "N/A"}</div>
            <div className="text-[11px] text-white/80">Last login: {new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="px-3.5 space-y-3 -mt-3 relative">
        <div className="bg-white rounded-[18px] p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-500 text-sm">Total balance</div>
              <div className="text-[26px] font-black text-slate-900">{formatCredits(Number(user?.wallet) || 0)}</div>
            </div>
            <button onClick={goWallet} className="bg-[#ff5a4a] text-white rounded-full px-4 py-2 text-sm font-bold">Enter wallet</button>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4 text-center text-[11px] font-semibold text-slate-700">
            <button onClick={goWallet} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">💳</div>
              ARWallet
            </button>
            <button onClick={goWallet} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">⬇</div>
              Deposit
            </button>
            <button onClick={goWallet} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">⬆</div>
              Withdraw
            </button>
            <button onClick={goReferral} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-xl">🎁</div>
              Refer
            </button>
          </div>
        </div>

        {/* Referral promo card */}
        <button onClick={goReferral} className="w-full bg-gradient-to-r from-[#ff5a4a] to-[#e53935] text-white rounded-[18px] p-4 shadow-sm text-left">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-lg">🎁 Refer & Earn ₹{REFERRAL_BONUS}</div>
              <div className="text-sm text-white/90 mt-1">Code: <b className="font-mono">{user?.referralCode || "—"}</b></div>
              <div className="text-xs text-white/80 mt-1">{user?.referralCount || 0} friends joined · ₹{user?.pendingReferralEarnings || 0} pending</div>
            </div>
            <div className="text-3xl">→</div>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={goHistory} className="bg-white rounded-[16px] p-3.5 border border-slate-200 shadow-sm text-left">
            <div className="text-xl">📊</div>
            <div className="font-bold text-slate-900 mt-1">Game History</div>
            <div className="text-[11px] text-slate-500">My game history</div>
            <div className="text-[11px] text-slate-500 mt-1">{stats.total} bets · {stats.won}W/{stats.lost}L</div>
          </button>
          <div className="bg-white rounded-[16px] p-3.5 border border-slate-200 shadow-sm">
            <div className="text-xl">📄</div>
            <div className="font-bold text-slate-900 mt-1">Transaction</div>
            <div className="text-[11px] text-slate-500">My transaction history</div>
          </div>
          <button onClick={goWallet} className="bg-white rounded-[16px] p-3.5 border border-slate-200 shadow-sm text-left">
            <div className="text-xl">⬇</div>
            <div className="font-bold text-slate-900 mt-1">Deposit</div>
            <div className="text-[11px] text-slate-500">My deposit history</div>
            <div className="text-[11px] text-slate-500 mt-1">{deposits.length} records</div>
          </button>
          <button onClick={goWallet} className="bg-white rounded-[16px] p-3.5 border border-slate-200 shadow-sm text-left">
            <div className="text-xl">⬆</div>
            <div className="font-bold text-slate-900 mt-1">Withdraw</div>
            <div className="text-[11px] text-slate-500">My withdraw history</div>
            <div className="text-[11px] text-slate-500 mt-1">{withdrawals.length} records</div>
          </button>
        </div>

        <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm divide-y divide-slate-100">
          <button onClick={goReferral} className="w-full flex items-center justify-between px-4 py-3.5">
            <span className="flex items-center gap-3"><span className="text-lg">🎁</span> Referral Program</span>
            <span className="text-slate-400">›</span>
          </button>
          <button onClick={goSupport} className="w-full flex items-center justify-between px-4 py-3.5">
            <span className="flex items-center gap-3"><span className="text-lg">🔔</span> Notification</span>
            <span className="text-slate-400">›</span>
          </button>
          <button onClick={()=>setShowSecurity(!showSecurity)} className="w-full flex items-center justify-between px-4 py-3.5">
            <span className="flex items-center gap-3"><span className="text-lg">🔒</span> Security - Change Password</span>
            <span className="text-slate-400">{showSecurity ? "⌄" : "›"}</span>
          </button>
          <button onClick={goSupport} className="w-full flex items-center justify-between px-4 py-3.5">
            <span className="flex items-center gap-3"><span className="text-lg">🛟</span> Support Center</span>
            <span className="text-slate-400">›</span>
          </button>
        </div>

        {showSecurity && (
          <div className="bg-white rounded-[16px] p-4 border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-2">Change Password</h3>
            <p className="text-xs text-slate-500 mb-3">Password is stored as salted SHA-256. 5 failed logins = 5 min lockout.</p>
            <PasswordChangeForm accent="cyan" onChangePassword={onChangePassword} />
          </div>
        )}

        <button onClick={onLogout} className="w-full bg-white border border-red-200 text-red-600 rounded-xl py-3 font-bold">Logout</button>

        <div className="text-center text-[11px] text-slate-400 pb-2">
          MARKET 90XX · UID {user?.userId} · Play Responsibly 18+
        </div>
      </div>
    </div>
  );
}