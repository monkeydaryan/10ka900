import { db } from "@/firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
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
} as const;

// Keys that stay in localStorage (session/security only)
const LOCAL_ONLY_KEYS = new Set<string>([K.currentUser, K.loginGuard]);

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
  } catch {
    /* ignore */
  }
};

const localRemove = (key: string) => {
  window.localStorage.removeItem(key);
};

const memoryCache: Record<string, any> = {};
const initialized: Record<string, boolean> = {};

export const readStorage = <T,>(key: string, fallback: T): T => {
  if (LOCAL_ONLY_KEYS.has(key)) {
    return localRead(key, fallback);
  }
  if (key in memoryCache) {
    return memoryCache[key] as T;
  }
  if (!initialized[key]) {
    initialized[key] = true;
    void loadFromFirestore(key, fallback);
  }
  return fallback;
};

async function loadFromFirestore<T>(key: string, fallback: T) {
  try {
    const docRef = doc(db, "app_data", key);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      memoryCache[key] = snap.data().value ?? fallback;
    } else {
      memoryCache[key] = fallback;
    }
    window.dispatchEvent(new Event("firebase-sync"));
  } catch (err) {
    console.error(`Failed to load ${key} from Firestore:`, err);
    memoryCache[key] = fallback;
  }
}

export const writeStorage = <T,>(key: string, value: T) => {
  if (LOCAL_ONLY_KEYS.has(key)) {
    localWrite(key, value);
    return;
  }
  memoryCache[key] = value;
  void writeToFirestore(key, value);
};

async function writeToFirestore<T>(key: string, value: T) {
  try {
    const docRef = doc(db, "app_data", key);
    await setDoc(docRef, { value, updatedAt: Date.now() });
  } catch (err) {
    console.error(`Failed to write ${key} to Firestore:`, err);
  }
}

export const removeStorage = (key: string) => {
  if (LOCAL_ONLY_KEYS.has(key)) {
    localRemove(key);
    return;
  }
  delete memoryCache[key];
  void writeToFirestore(key, null);
};

export const stable = <T,>(prev: T, next: T): T =>
  JSON.stringify(prev) === JSON.stringify(next) ? prev : next;

export function startFirebaseSync() {
  const collRef = collection(db, "app_data");
  return onSnapshot(collRef, (snapshot) => {
    let changed = false;
    snapshot.docChanges().forEach((change) => {
      const key = change.doc.id;
      if (LOCAL_ONLY_KEYS.has(key)) return;
      const newValue = change.doc.data().value;
      if (JSON.stringify(memoryCache[key]) !== JSON.stringify(newValue)) {
        memoryCache[key] = newValue;
        changed = true;
      }
    });
    if (changed) {
      window.dispatchEvent(new Event("firebase-sync"));
    }
  });
}