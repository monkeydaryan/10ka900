import { db } from "@/firebase/config";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

export const K = {
  users: "users",
  currentUser: "m90x_current_user_v1",
  bets: "bets",
  deposits: "deposits",
  withdrawals: "withdrawals",
  tickets: "tickets",
  markets: "markets",
  events: "events",
  adminAuth: "adminAuth",
  loginGuard: "m90x_login_guard_v1",
  referralClaims: "referralClaims",  // NEW
} as const;

const LOCAL_ONLY_KEYS = new Set<string>([K.currentUser, K.loginGuard]);

const memoryCache: Record<string, unknown> = {};
const initialized: Record<string, boolean> = {};
const pendingWrites: Record<string, number> = {};

const localRead = <T,>(key: string, fallback: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
};

const localWrite = <T,>(key: string, value: T) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const localRemove = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch {}
};

function cleanForFirebase(value: any): any {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map(cleanForFirebase);
  }
  const cleaned: Record<string, any> = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      const cleanedValue = cleanForFirebase(value[key]);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
  }
  return cleaned;
}

async function loadFromFirestore<T>(key: string, fallback: T) {
  try {
    const ref = doc(db, "app_data", key);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data().value;
      memoryCache[key] = data !== null && data !== undefined ? data : fallback;
    } else {
      memoryCache[key] = fallback;
      await setDoc(ref, { value: cleanForFirebase(fallback), updatedAt: Date.now() });
    }
    window.dispatchEvent(new Event("firebase-sync"));
  } catch (error) {
    console.error(`Firebase read failed for ${key}:`, error);
    memoryCache[key] = fallback;
  }
}

async function writeToFirestore<T>(key: string, value: T) {
  try {
    const ref = doc(db, "app_data", key);
    const cleanedValue = cleanForFirebase(value);
    await setDoc(ref, {
      value: cleanedValue,
      updatedAt: Date.now(),
    });
    console.log(`✅ Firebase write success: ${key}`, cleanedValue);
  } catch (error) {
    console.error(`❌ Firebase write failed for ${key}:`, error);
  }
}

export const readStorage = <T,>(key: string, fallback: T): T => {
  if (LOCAL_ONLY_KEYS.has(key)) {
    return localRead(key, fallback);
  }
  if (Object.prototype.hasOwnProperty.call(memoryCache, key)) {
    return memoryCache[key] as T;
  }
  if (!initialized[key]) {
    initialized[key] = true;
    void loadFromFirestore(key, fallback);
  }
  return fallback;
};

export const writeStorage = <T,>(key: string, value: T) => {
  if (LOCAL_ONLY_KEYS.has(key)) {
    localWrite(key, value);
    return;
  }
  memoryCache[key] = value;
  if (pendingWrites[key]) {
    clearTimeout(pendingWrites[key]);
  }
  pendingWrites[key] = window.setTimeout(() => {
    void writeToFirestore(key, value);
    delete pendingWrites[key];
  }, 100);
};

export const removeStorage = (key: string) => {
  if (LOCAL_ONLY_KEYS.has(key)) {
    localRemove(key);
    return;
  }
  memoryCache[key] = null;
  void writeToFirestore(key, null);
};

export const stable = <T,>(prev: T, next: T): T =>
  JSON.stringify(prev) === JSON.stringify(next) ? prev : next;

export function startFirebaseSync() {
  const ref = collection(db, "app_data");
  return onSnapshot(
    ref,
    (snapshot) => {
      let changed = false;
      snapshot.docChanges().forEach((change) => {
        const key = change.doc.id;
        if (LOCAL_ONLY_KEYS.has(key)) return;
        if (pendingWrites[key]) {
          console.log(`⏸️ Skipping sync for ${key} (pending write)`);
          return;
        }
        const value = change.doc.data().value;
        if (JSON.stringify(memoryCache[key]) !== JSON.stringify(value)) {
          memoryCache[key] = value;
          changed = true;
          console.log(`🔄 Firebase sync update: ${key}`, value);
        }
      });
      if (changed) {
        window.dispatchEvent(new Event("firebase-sync"));
      }
    },
    (error) => {
      console.error("Firebase realtime sync failed:", error);
    },
  );
}

export async function preloadAllData() {
  const keys = [K.users, K.bets, K.deposits, K.withdrawals, K.tickets, K.markets, K.events, K.adminAuth, K.referralClaims];
  await Promise.all(keys.map((key) => loadFromFirestore(key, [])));
  console.log("✅ All Firebase data preloaded");
}