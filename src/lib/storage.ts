export const K = {
  users: "m90x_users_v1",
  currentUser: "m90x_current_user_v1",
  bets: "m90x_bets_v1",
  deposits: "m90x_deposits_v1",
  withdrawals: "m90x_withdrawals_v1",
  tickets: "m90x_tickets_v1",
  markets: "m90x_markets_v1",
  events: "m90x_events_v1",
  adminAuth: "m90x_admin_auth_v1",
  loginGuard: "m90x_login_guard_v1",
} as const;

export const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const writeStorage = <T,>(key: string, value: T) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full (large screenshots); the in-memory state still works.
  }
};

export const removeStorage = (key: string) => {
  window.localStorage.removeItem(key);
};

/** Returns the previous reference when content is identical, to avoid useless re-renders. */
export const stable = <T,>(prev: T, next: T): T =>
  JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
