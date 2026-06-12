import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0qU7OhEbwWzYWzv-E30vPhWjAPyfdMKU",
  authDomain: "market-90xx.firebaseapp.com",
  projectId: "market-90xx",
  storageBucket: "market-90xx.firebasestorage.app",
  messagingSenderId: "160454479089",
  appId: "1:160454479089:web:6ccfe58d1c4f3d59a8ed50",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);