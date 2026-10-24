import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export const isFirebaseConfigured = Boolean(
  apiKey &&
  apiKey !== "replace_me" &&
  projectId &&
  projectId !== "replace_me"
);

// Fallback config prevents build crashes when credentials are not yet added to .env.local
const config = {
  apiKey: isFirebaseConfigured ? apiKey : "AIzaSyCalifncoDemoModePlaceholderKey123456",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "califnco-placeholder.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "califnco-placeholder",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "califnco-placeholder.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:placeholder",
};

const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(config);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

