import { useEffect, useState } from "react";
import {
  API_BASE,
  BRAND,
  DEFAULT_ADMIN_PASSWORD,
  DOUBLE_MULTIPLIER,
  LOCKOUT_MINUTES,
  MAX_DOUBLE_BET,
  MAX_LOGIN_ATTEMPTS,
  MIN_DEPOSIT,
  MIN_WITHDRAW,
  OWNER_EMAIL,
  SPLIT_MULTIPLIER,
  createId,
  createSalt,
  createUserId,
  formatCredits,
  hashPassword,
  initialMarkets,
  isBettingOpen,
  passwordIssues,
} from "@/lib/types";
import type {
  ActivityEvent,
  Bet,
  BetMode,
  BetStatus,
  DepositRequest,
  Market,
  MarketId,
  MarketState,
  RequestStatus,
  SplitSide,
  SupportTicket,
  TicketStatus,
  UserProfile,
  WithdrawRequest,
} from "@/lib/types";
import { K, readStorage, removeStorage, stable, writeStorage } from "@/lib/storage";
import { AdminLogin, Landing, LoginScreen, RegisterScreen } from "@/components/Auth";
import { Dashboard } from "@/components/Dashboard";
import type { UserTab, WithdrawForm } from "@/components/Dashboard";
import { AdminConsole } from "@/components/Admin";

type Screen = "landing" | "register" | "login" | "admin-login" | "dashboard" | "admin";

const notifyOwner = (subject: string, body: string) => {
  void fetch(`${API_BASE}/notify-owner.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: OWNER_EMAIL, subject, body }),
  }).catch(() => undefined);
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [users, setUsers] = useState<UserProfile[]>(() => readStorage(K.users, []));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => readStorage<UserProfile | null>(K.currentUser, null));
  const [bets, setBets] = useState<Bet[]>(() => readStorage(K.bets, []));
  const [deposits, setDeposits] = useState<DepositRequest[]>(() => readStorage(K.deposits, []));
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>(() => readStorage(K.withdrawals, []));
  const [tickets, setTickets] = useState<SupportTicket[]>(() => readStorage(K.tickets, []));
  const [markets, setMarkets] = useState<Market[]>(() => readStorage(K.markets, initialMarkets));
  const [events, setEvents] = useState<ActivityEvent[]>(() => readStorage(K.events, []));
  const [activeTab, setActiveTab] = useState<UserTab>("hsi");

  /* ------------------------------------------------------------ */
  /* Live sync: cross-tab storage events + polling for admin views */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    const sync = () => {
      setUsers((prev) => stable(prev, readStorage(K.users, prev)));
      setBets((prev) => stable(prev, readStorage(K.bets, prev)));
      setDeposits((prev) => stable(prev, readStorage(K.deposits, prev)));
      setWithdrawals((prev) => stable(prev, readStorage(K.withdrawals, prev)));
      setTickets((prev) => stable(prev, readStorage(K.tickets, prev)));
      setMarkets((prev) => stable(prev, readStorage(K.markets, prev)));
      setEvents((prev) => stable(prev, readStorage(K.events, prev)));
      setCurrentUser((prev) => stable(prev, readStorage<UserProfile | null>(K.currentUser, prev)));
    };
    window.addEventListener("storage", sync);
    const interval = window.setInterval(sync, 3000);
    return () => {
      window.removeEventListener("storage", sync);
      window.clearInterval(interval);
    };
  }, []);

  /* ------------------------------------------------------------ */
  /* Persistence helpers                                            */
  /* ------------------------------------------------------------ */
  const persistUsers = (next: UserProfile[]) => {
    setUsers(next);
    writeStorage(K.users, next);
  };
  const persistBets = (next: Bet[]) => {
    setBets(next);
    writeStorage(K.bets, next);
  };
  const persistDeposits = (next: DepositRequest[]) => {
    setDeposits(next);
    writeStorage(K.deposits, next);
  };
  const persistWithdrawals = (next: WithdrawRequest[]) => {
    setWithdrawals(next);
    writeStorage(K.withdrawals, next);
  };
  const persistTickets = (next: SupportTicket[]) => {
    setTickets(next);
    writeStorage(K.tickets, next);
  };
  const persistMarkets = (next: Market[]) => {
    setMarkets(next);
    writeStorage(K.markets, next);
  };
  const updateCurrentUser = (profile: UserProfile | null) => {
    setCurrentUser(profile);
    if (profile) writeStorage(K.currentUser, profile);
    else removeStorage(K.currentUser);
  };
  const logEvent = (type: ActivityEvent["type"], title: string, detail: string) => {
    const event: ActivityEvent = { id: createId("EV"), type, title, detail, at: new Date().toISOString() };
    setEvents((prev) => {
      const next = [event, ...prev].slice(0, 200);
      writeStorage(K.events, next);
      return next;
    });
  };

  /* ------------------------------------------------------------ */
  /* Auth — salted hashes, brute-force lockout, no plaintext        */
  /* ------------------------------------------------------------ */

  type GuardEntry = { fails: number; lockedUntil: number };
  const readGuard = (): Record<string, GuardEntry> => readStorage(K.loginGuard, {});
  const writeGuard = (guard: Record<string, GuardEntry>) => writeStorage(K.loginGuard, guard);

  const checkLockout = (key: string): string | null => {
    const entry = readGuard()[key];
    if (entry && entry.lockedUntil > Date.now()) {
      const minutes = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
      return `Too many failed attempts. Account locked for ${minutes} more minute${minutes === 1 ? "" : "s"}.`;
    }
    return null;
  };

  const recordFailure = (key: string): string => {
    const guard = readGuard();
    const entry = guard[key] ?? { fails: 0, lockedUntil: 0 };
    entry.fails += 1;
    if (entry.fails >= MAX_LOGIN_ATTEMPTS) {
      entry.lockedUntil = Date.now() + LOCKOUT_MINUTES * 60000;
      entry.fails = 0;
      guard[key] = entry;
      writeGuard(guard);
      return `Too many failed attempts. Locked for ${LOCKOUT_MINUTES} minutes to protect the account.`;
    }
    guard[key] = entry;
    writeGuard(guard);
    return `Incorrect credentials. ${MAX_LOGIN_ATTEMPTS - entry.fails} attempt(s) left before a temporary lock.`;
  };

  const clearFailures = (key: string) => {
    const guard = readGuard();
    delete guard[key];
    writeGuard(guard);
  };

  const handleRegistered = async (name: string, phone: string, password: string) => {
    const salt = createSalt();
    const passwordHash = await hashPassword(password, salt);
    const profile: UserProfile = {
      userId: createUserId(),
      name,
      email: "",
      phone,
      wallet: 2500,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash,
    };
    persistUsers([...users, profile]);
    updateCurrentUser(profile);
    logEvent("registration", `New registration: ${name}`, `${profile.userId} · ${phone} — forwarded to ${OWNER_EMAIL}`);
    notifyOwner(
      `${BRAND}: new registration ${profile.userId}`,
      `Name: ${name}\nPhone: ${phone}\nUser ID: ${profile.userId}\nRegistered: ${profile.createdAt}`,
    );
    void fetch(`${API_BASE}/register.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, display_name: name, password }),
    }).catch(() => undefined);
    setActiveTab("hsi");
    setScreen("dashboard");
  };

  const handleUserLogin = async (phone: string, password: string): Promise<string | null> => {
    if (!phone || !password) return "Phone number and password are required.";
    const lockMessage = checkLockout(`user:${phone}`);
    if (lockMessage) return lockMessage;

    const profile = users.find((user) => user.phone === phone);
    if (!profile) return recordFailure(`user:${phone}`);

    const attempt = await hashPassword(password, profile.salt);
    if (attempt !== profile.passwordHash) return recordFailure(`user:${phone}`);

    clearFailures(`user:${phone}`);
    updateCurrentUser(profile);
    logEvent("login", `Login: ${profile.name}`, `${profile.userId} · ${phone} — reported to ${OWNER_EMAIL}`);
    notifyOwner(`${BRAND}: login ${profile.userId}`, `User ${profile.name} (${phone}) logged in at ${new Date().toISOString()}`);
    setActiveTab("hsi");
    setScreen("dashboard");
    return null;
  };

  const changeUserPassword = async (currentPassword: string, newPassword: string): Promise<string | null> => {
    if (!currentUser) return "You must be logged in.";
    const currentHash = await hashPassword(currentPassword, currentUser.salt);
    if (currentHash !== currentUser.passwordHash) return "Your current password is incorrect.";
    const issues = passwordIssues(newPassword);
    if (issues.length > 0) return `New password is too weak: ${issues.join(", ").toLowerCase()}.`;
    if (newPassword === currentPassword) return "New password must be different from the current one.";

    const salt = createSalt();
    const passwordHash = await hashPassword(newPassword, salt);
    const updated = { ...currentUser, salt, passwordHash };
    persistUsers(users.map((user) => (user.userId === currentUser.userId ? updated : user)));
    updateCurrentUser(updated);
    logEvent("login", `Password changed: ${updated.name}`, `${updated.userId} updated their account password`);
    return null;
  };

  /* Admin auth: default password is set by the server (ChangeMe123!), changeable afterwards. */
  type AdminAuth = { salt: string; hash: string };

  const getAdminAuth = async (): Promise<AdminAuth> => {
    const stored = readStorage<AdminAuth | null>(K.adminAuth, null);
    if (stored) return stored;
    const salt = createSalt();
    const hash = await hashPassword(DEFAULT_ADMIN_PASSWORD, salt);
    const fresh = { salt, hash };
    writeStorage(K.adminAuth, fresh);
    return fresh;
  };

  const handleAdminLogin = async (username: string, password: string) => {
    const lockMessage = checkLockout("admin");
    if (lockMessage) return false;
    if (username.trim().toLowerCase() !== "admin") {
      recordFailure("admin");
      return false;
    }
    const auth = await getAdminAuth();
    const attempt = await hashPassword(password, auth.salt);
    if (attempt !== auth.hash) {
      recordFailure("admin");
      return false;
    }
    clearFailures("admin");
    void fetch(`${API_BASE}/admin-login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).catch(() => undefined);
    setScreen("admin");
    return true;
  };

  const changeAdminPassword = async (currentPassword: string, newPassword: string): Promise<string | null> => {
    const auth = await getAdminAuth();
    const attempt = await hashPassword(currentPassword, auth.salt);
    if (attempt !== auth.hash) return "Current admin password is incorrect.";
    const issues = passwordIssues(newPassword);
    if (issues.length > 0) return `New password is too weak: ${issues.join(", ").toLowerCase()}.`;
    const salt = createSalt();
    const hash = await hashPassword(newPassword, salt);
    writeStorage(K.adminAuth, { salt, hash });
    logEvent("login", "Admin password changed", "The admin console password was rotated successfully");
    void fetch(`${API_BASE}/admin-change-password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }).catch(() => undefined);
    return null;
  };

  const logout = () => {
    updateCurrentUser(null);
    setScreen("landing");
  };

  /* ------------------------------------------------------------ */
  /* Betting (no daily limit)                                       */
  /* ------------------------------------------------------------ */
  const placeBet = (market: Market, mode: BetMode, selection: string, stake: number, splitSide?: SplitSide): string | null => {
    if (!currentUser) return "You must be logged in.";
    if (!isBettingOpen(market, new Date()))
      return market.status === "locked"
        ? `Betting on ${market.name} is currently locked by admin.`
        : `Betting on ${market.name} is closed — the cutoff is ${market.cutoffLabel} sharp.`;
    if (!Number.isFinite(stake) || stake < 1) return "Stake must be at least 1 credit.";
    if (mode === "double" && stake > MAX_DOUBLE_BET)
      return `Maximum bet on a single double-digit number is ${MAX_DOUBLE_BET} credits.`;
    if (currentUser.wallet < stake) return "Insufficient credits for this stake.";
    if (mode === "double" && !/^\d{2}$/.test(selection)) return "Pick a number between 00 and 99.";
    if (mode === "split" && !/^\d$/.test(selection)) return "Pick a single digit between 0 and 9.";

    const potentialReturn = stake * (mode === "double" ? DOUBLE_MULTIPLIER : SPLIT_MULTIPLIER);
    const bet: Bet = {
      id: createId("BET"),
      userId: currentUser.userId,
      userName: currentUser.name,
      marketId: market.id,
      marketName: market.name,
      mode,
      selection,
      splitSide,
      stake,
      potentialReturn,
      status: "pending",
      placedAt: new Date().toISOString(),
    };
    const debited = { ...currentUser, wallet: currentUser.wallet - stake };
    persistUsers(users.map((user) => (user.userId === currentUser.userId ? debited : user)));
    updateCurrentUser(debited);
    persistBets([bet, ...bets]);
    logEvent("bet", `Bet: ${currentUser.name} on ${market.name}`, `${bet.userId} staked ${formatCredits(stake)} on ${mode === "double" ? selection : `${splitSide} ${selection}`} — potential ${formatCredits(potentialReturn)}`);
    return null;
  };

  /* ------------------------------------------------------------ */
  /* Deposits                                                       */
  /* ------------------------------------------------------------ */
  const createDeposit = (transactionId: string, amount: number): string | null => {
    if (!currentUser) return "You must be logged in.";
    const cleanTx = transactionId.trim().toUpperCase();
    if (!cleanTx) return "Transaction ID is required.";
    if (cleanTx.length < 6) return "That transaction ID looks too short — please paste the full ID.";
    if (!Number.isFinite(amount) || amount < MIN_DEPOSIT) return `Minimum deposit is ${MIN_DEPOSIT} credits.`;
    if (deposits.some((d) => d.transactionId === cleanTx)) return "This transaction ID has already been submitted.";

    const request: DepositRequest = {
      id: createId("DEP"),
      userId: currentUser.userId,
      userName: currentUser.name,
      transactionId: cleanTx,
      amount,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    persistDeposits([request, ...deposits]);
    logEvent("deposit", `Deposit request: ${currentUser.name}`, `${request.userId} · ${cleanTx} · ${formatCredits(amount)} — awaiting admin verification`);
    void fetch(`${API_BASE}/credit-request.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUser.userId, transaction_id: cleanTx, requested_credits: amount }),
    }).catch(() => undefined);
    return null;
  };

  const approveDeposit = (id: string) => {
    const request = deposits.find((d) => d.id === id);
    if (!request || request.status !== "pending") return;
    const nextUsers = users.map((user) =>
      user.userId === request.userId ? { ...user, wallet: user.wallet + request.amount } : user,
    );
    persistUsers(nextUsers);
    persistDeposits(deposits.map((d) => (d.id === id ? { ...d, status: "approved" as RequestStatus } : d)));
    if (currentUser?.userId === request.userId) {
      const updated = nextUsers.find((user) => user.userId === request.userId);
      if (updated) updateCurrentUser(updated);
    }
    logEvent("deposit", `Deposit approved: ${request.userName}`, `${request.userId} credited ${formatCredits(request.amount)} real credits (TX ${request.transactionId})`);
    void fetch(`${API_BASE}/admin-grant-credit.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: id, credits: request.amount }),
    }).catch(() => undefined);
  };

  const rejectDeposit = (id: string) => {
    const request = deposits.find((d) => d.id === id);
    if (!request || request.status !== "pending") return;
    persistDeposits(deposits.map((d) => (d.id === id ? { ...d, status: "rejected" as RequestStatus } : d)));
    logEvent("deposit", `Deposit rejected: ${request.userName}`, `${request.userId} · TX ${request.transactionId} could not be verified`);
  };

  /* ------------------------------------------------------------ */
  /* Withdrawals (hold immediately, refund on reject)               */
  /* ------------------------------------------------------------ */
  const requestWithdraw = (form: WithdrawForm): string | null => {
    if (!currentUser) return "You must be logged in.";
    if (!form.bankName.trim() || !form.accountHolder.trim()) return "Bank name and account holder name are required.";
    if (form.accountNumber.replace(/\D/g, "").length < 8) return "Please enter a valid bank account number.";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.trim())) return "Please enter a valid IFSC code (e.g. HDFC0001234).";
    if (!Number.isFinite(form.amount) || form.amount < MIN_WITHDRAW) return `Minimum withdrawal is ${MIN_WITHDRAW} credits.`;
    if (form.amount > currentUser.wallet) return `You only have ${formatCredits(currentUser.wallet)} in your wallet.`;

    const request: WithdrawRequest = {
      id: createId("WDL"),
      userId: currentUser.userId,
      userName: currentUser.name,
      amount: form.amount,
      bankName: form.bankName.trim(),
      accountHolder: form.accountHolder.trim(),
      accountNumber: form.accountNumber.replace(/\D/g, ""),
      ifsc: form.ifsc.trim().toUpperCase(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const held = { ...currentUser, wallet: currentUser.wallet - form.amount };
    persistUsers(users.map((user) => (user.userId === currentUser.userId ? held : user)));
    updateCurrentUser(held);
    persistWithdrawals([request, ...withdrawals]);
    logEvent("withdraw", `Withdrawal request: ${currentUser.name}`, `${request.userId} requested ${formatCredits(form.amount)} to ${request.bankName} ····${request.accountNumber.slice(-4)} — amount held`);
    return null;
  };

  const approveWithdraw = (id: string) => {
    const request = withdrawals.find((w) => w.id === id);
    if (!request || request.status !== "pending") return;
    persistWithdrawals(withdrawals.map((w) => (w.id === id ? { ...w, status: "approved" as RequestStatus } : w)));
    logEvent("withdraw", `Withdrawal approved: ${request.userName}`, `Payout of ${formatCredits(request.amount)} initiated to ${request.bankName} ····${request.accountNumber.slice(-4)}`);
  };

  const rejectWithdraw = (id: string) => {
    const request = withdrawals.find((w) => w.id === id);
    if (!request || request.status !== "pending") return;
    const nextUsers = users.map((user) =>
      user.userId === request.userId ? { ...user, wallet: user.wallet + request.amount } : user,
    );
    persistUsers(nextUsers);
    persistWithdrawals(withdrawals.map((w) => (w.id === id ? { ...w, status: "rejected" as RequestStatus } : w)));
    if (currentUser?.userId === request.userId) {
      const updated = nextUsers.find((user) => user.userId === request.userId);
      if (updated) updateCurrentUser(updated);
    }
    logEvent("withdraw", `Withdrawal rejected: ${request.userName}`, `${formatCredits(request.amount)} hold refunded to ${request.userId}`);
  };

  /* ------------------------------------------------------------ */
  /* Support tickets                                                */
  /* ------------------------------------------------------------ */
  const createTicket = (topic: string, message: string, transactionId?: string, screenshot?: string, screenshotName?: string) => {
    if (!currentUser) return;
    const ticket: SupportTicket = {
      id: createId("TKT"),
      userId: currentUser.userId,
      userName: currentUser.name,
      topic,
      message,
      transactionId,
      screenshot,
      screenshotName,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    persistTickets([ticket, ...tickets]);
    logEvent("support", `Support ticket: ${currentUser.name}`, `${ticket.userId} · ${topic}${transactionId ? ` · TX ${transactionId}` : ""}${screenshotName ? " · screenshot attached" : ""}`);
  };

  const resolveTicket = (id: string) => {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return;
    persistTickets(tickets.map((t) => (t.id === id ? { ...t, status: "resolved" as TicketStatus } : t)));
    logEvent("support", `Ticket resolved: ${ticket.userName}`, `${ticket.userId} · ${ticket.topic}`);
  };

  /* ------------------------------------------------------------ */
  /* Settlement                                                     */
  /* ------------------------------------------------------------ */
  const refundPendingBetsForMarket = (marketId: MarketId, reason: string) => {
    const refunds = new Map<string, number>();
    const nextBets = bets.map((bet) => {
      if (bet.marketId !== marketId || bet.status !== "pending") return bet;
      refunds.set(bet.userId, (refunds.get(bet.userId) ?? 0) + bet.stake);
      return { ...bet, status: "refunded" as BetStatus, payout: 0 };
    });

    if (refunds.size === 0) {
      persistBets(nextBets);
      return 0;
    }

    const nextUsers = users.map((user) => {
      const refund = refunds.get(user.userId);
      return refund ? { ...user, wallet: user.wallet + refund } : user;
    });

    persistBets(nextBets);
    persistUsers(nextUsers);
    if (currentUser) {
      const updated = nextUsers.find((user) => user.userId === currentUser.userId);
      if (updated) updateCurrentUser(updated);
    }

    const totalRefund = Array.from(refunds.values()).reduce((sum, amount) => sum + amount, 0);
    const marketName = markets.find((m) => m.id === marketId)?.name ?? marketId;
    logEvent("bet", `Market locked: ${marketName}`, `${formatCredits(totalRefund)} refunded to ${refunds.size} user(s) after ${reason}`);
    return totalRefund;
  };

  const closeMarket = (marketId: MarketId) => {
    const nextMarkets = markets.map((market) =>
      market.id === marketId ? { ...market, status: "locked" as MarketState } : market,
    );
    persistMarkets(nextMarkets);
    refundPendingBetsForMarket(marketId, "admin lock");
    const marketName = markets.find((m) => m.id === marketId)?.name ?? marketId;
    logEvent("bet", `Market locked manually: ${marketName}`, `Betting closed by admin and pending stakes refunded.`);
  };

  const openMarket = (marketId: MarketId) => {
    const nextMarkets = markets.map((market) =>
      market.id === marketId ? { ...market, status: "open" as MarketState } : market,
    );
    persistMarkets(nextMarkets);
    const marketName = markets.find((m) => m.id === marketId)?.name ?? marketId;
    logEvent("bet", `Market opened manually: ${marketName}`, `Betting reopened by admin.`);
  };

  const rejectBet = (betId: string) => {
    const bet = bets.find((item) => item.id === betId && item.status === "pending");
    if (!bet) return;

    const nextBets = bets.map((item) =>
      item.id === betId ? { ...item, status: "refunded" as BetStatus, payout: 0 } : item,
    );
    const nextUsers = users.map((user) =>
      user.userId === bet.userId ? { ...user, wallet: user.wallet + bet.stake } : user,
    );

    persistBets(nextBets);
    persistUsers(nextUsers);
    if (currentUser?.userId === bet.userId) {
      const updated = nextUsers.find((user) => user.userId === bet.userId);
      if (updated) updateCurrentUser(updated);
    }
    logEvent("bet", `Bet rejected: ${bet.userName}`, `${bet.userId} stake ${formatCredits(bet.stake)} refunded for ${bet.selection}`);
  };

  const settleMarket = (marketId: MarketId, resultDecimal: string) => {
    const normalized = resultDecimal.padStart(2, "0").slice(-2);
    const nextMarkets = markets.map((market) =>
      market.id === marketId
        ? { ...market, resultDecimal: normalized, status: "settled" as MarketState, history: [...market.history.slice(-4), normalized] }
        : market,
    );

    const winnings = new Map<string, number>();
    const nextBets = bets.map((bet) => {
      if (bet.marketId !== marketId || bet.status !== "pending") return bet;
      const didWin =
        bet.mode === "double"
          ? bet.selection === normalized
          : bet.splitSide === "Andar"
            ? bet.selection === normalized[0]
            : bet.selection === normalized[1];
      const payout = didWin ? bet.potentialReturn : 0;
      if (payout > 0) winnings.set(bet.userId, (winnings.get(bet.userId) ?? 0) + payout);
      return { ...bet, status: didWin ? ("won" as BetStatus) : ("lost" as BetStatus), resultDecimal: normalized, payout };
    });

    const nextUsers = users.map((user) => ({ ...user, wallet: user.wallet + (winnings.get(user.userId) ?? 0) }));
    persistMarkets(nextMarkets);
    persistBets(nextBets);
    persistUsers(nextUsers);
    if (currentUser) {
      const updated = nextUsers.find((user) => user.userId === currentUser.userId);
      if (updated) updateCurrentUser(updated);
    }
    const marketName = markets.find((m) => m.id === marketId)?.name ?? marketId;
    logEvent("bet", `Market settled: ${marketName}`, `Winning decimals .${normalized} — ${winnings.size} winning user(s) paid instantly`);
  };

  /* ------------------------------------------------------------ */
  /* Screens                                                        */
  /* ------------------------------------------------------------ */
  if (screen === "register") {
    return (
      <RegisterScreen
        onBack={() => setScreen("landing")}
        onRegistered={handleRegistered}
      />
    );
  }

  if (screen === "login") {
    return (
      <LoginScreen
        onBack={() => setScreen("landing")}
        onRegisterInstead={() => setScreen("register")}
        onLogin={handleUserLogin}
      />
    );
  }

  if (screen === "admin-login") {
    return <AdminLogin onBack={() => setScreen("landing")} onLogin={handleAdminLogin} />;
  }

  if (screen === "admin") {
    return (
      <AdminConsole
        users={users}
        bets={bets}
        deposits={deposits}
        withdrawals={withdrawals}
        tickets={tickets}
        events={events}
        markets={markets}
        onBack={() => setScreen("landing")}
        onApproveDeposit={approveDeposit}
        onRejectDeposit={rejectDeposit}
        onApproveWithdraw={approveWithdraw}
        onRejectWithdraw={rejectWithdraw}
        onResolveTicket={resolveTicket}
        onSettleMarket={settleMarket}
        onCloseMarket={closeMarket}
        onOpenMarket={openMarket}
        onRejectBet={rejectBet}
        onChangePassword={changeAdminPassword}
      />
    );
  }

  if (screen === "dashboard" && currentUser) {
    return (
      <Dashboard
        user={currentUser}
        markets={markets}
        bets={bets.filter((bet) => bet.userId === currentUser.userId)}
        deposits={deposits.filter((deposit) => deposit.userId === currentUser.userId)}
        withdrawals={withdrawals.filter((withdrawal) => withdrawal.userId === currentUser.userId)}
        tickets={tickets.filter((ticket) => ticket.userId === currentUser.userId)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
        onPlaceBet={placeBet}
        onDeposit={createDeposit}
        onWithdraw={requestWithdraw}
        onTicket={createTicket}
        onChangePassword={changeUserPassword}
      />
    );
  }

  return (
    <Landing
      onLogin={() => setScreen("login")}
      onRegister={() => setScreen("register")}
      onAdmin={() => setScreen("admin-login")}
    />
  );
}
