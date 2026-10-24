import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!apiKey || apiKey === 'replace_me' || !projectId || projectId === 'replace_me') {
  console.error('\x1b[31m[Error] Firebase credentials not configured in admin-panel/.env.local\x1b[0m');
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log(`\x1b[36mConnecting to Firebase project: ${projectId}...\x1b[0m`);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Check if admin login args or env provided
const adminEmail = process.argv[2] || process.env.ADMIN_EMAIL;
const adminPassword = process.argv[3] || process.env.ADMIN_PASSWORD;

async function run() {
  if (adminEmail && adminPassword) {
    try {
      console.log(`Signing in as admin: ${adminEmail}...`);
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log(`\x1b[32mAdmin sign-in successful!\x1b[0m`);
    } catch (authErr) {
      console.error(`\x1b[33mWarning: Admin sign-in failed (${authErr.message}). Continuing with unauthenticated client...\x1b[0m`);
    }
  }

  // Read sample_products.json
  const samplePath = path.resolve(__dirname, '../../sample_products.json');
  const raw = fs.readFileSync(samplePath, 'utf8');
  const products = JSON.parse(raw);

  console.log(`Preparing to seed ${products.length} products into Firestore...`);

  try {
    const batch = writeBatch(db);
    let count = 0;
    for (const product of products) {
      const colRef = collection(db, 'products');
      const docRef = doc(colRef);
      batch.set(docRef, {
        ...product,
        createdAt: new Date(),
      });
      count++;
    }
    await batch.commit();
    console.log(`\x1b[32mSuccessfully seeded ${count} products into Firestore collection 'products'!\x1b[0m`);
  } catch (err) {
    if (err.code === 'permission-denied') {
      console.error('\n\x1b[31m[PERMISSION_DENIED] Firestore rules are blocking writes.\x1b[0m');
      console.error('\x1b[33mTo fix this, choose one of these options:\x1b[0m');
      console.error('1. In Firebase Console > Firestore Database > Rules: temporarily set:');
      console.error('   allow read, write: if true;');
      console.error('   and click Publish, then re-run this seed script.');
      console.error('2. OR pass your Firebase admin login:');
      console.error('   node scripts/seed.mjs your-admin@email.com your-password\n');
    } else {
      console.error('\x1b[31mError seeding products:\x1b[0m', err);
    }
    process.exit(1);
  }
}

run();
