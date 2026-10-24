# Califnco Water Purifier — Round 1 Assignment

This repository contains a runnable project foundation for both assignment parts:
1. Flutter + Firebase water-purifier shopping app.
2. Next.js + Firebase admin dashboard for Vercel.
3. n8n workflow template for scheduled Instagram product posts.

## Important
This is a credential-ready implementation scaffold, not a claim that external accounts have already been configured. Firebase, Meta/Instagram, image-generation, Google Sheets and Vercel credentials must be supplied by you. Test integrations with your own accounts before submission. Do not commit secrets.

## Folder structure
- `mobile_app/` — Flutter Android app
- `admin-panel/` — Next.js admin dashboard
- `automation/` — n8n workflow JSON and setup notes
- `firestore.rules` — starter Firestore security rules
- `sample_products.json` — 50 sample product records for importing/creating in Firestore

## Prerequisites
- Flutter SDK + Android Studio
- Node.js 20+ and npm
- Firebase account
- Git
- n8n (self-hosted or hosted)
- Instagram professional account + Meta developer app for publishing

## A. Firebase setup
1. Create a Firebase project.
2. Enable Authentication > Email/Password.
3. Create Firestore.
4. Add Android app with package name `com.califnco.waterpurifier`.
5. From the project root:
   ```powershell
   npm install -g firebase-tools
   firebase login
   dart pub global activate flutterfire_cli
   cd mobile_app
   flutter pub get
   flutterfire configure
   ```
6. Copy `firestore.rules` into Firebase Console > Firestore > Rules and publish only after reviewing the rules.
7. Create an admin user with Firebase Authentication, then manually set that user's `users/{uid}.role` to `admin` using the Firebase Console. Never allow users to set their own role.

## B. Run mobile app
```powershell
cd mobile_app
flutter pub get
flutter run
```
FlutterFire generates `lib/firebase_options.dart`; it is intentionally not included because it contains project-specific configuration.
The app supports email/password registration/login, customer/dealer roles, product browsing, cart, order creation/history, dealer request status and service booking. Admin account role is read from Firestore. Some optional integrations (push notifications, payment provider) require credentials and are documented as follow-up integration points.

To seed the 50 products, import `sample_products.json` into Firestore collection `products` using a script or Firebase Console. Each document should contain `name`, `category`, `price`, `wholesalePrice`, `description`, `imageUrl`, `stock`, `active`.

## C. Run admin dashboard
```powershell
cd admin-panel
copy .env.example .env.local
npm install
npm run dev
```
Fill `.env.local` with Firebase web-app configuration from Firebase Console > Project settings > Your apps. Deploy the `admin-panel` directory to Vercel as the project root and add the same environment variables in Vercel project settings.

The dashboard requires the signed-in Firebase user to have `role: "admin"` in `users/{uid}`. It provides product, order, and dealer approval views. Firestore rules remain the security boundary.

## D. Instagram automation
1. Import `automation/instagram_daily_product.json` into n8n.
2. Configure Google Sheets and Meta Graph API credentials in n8n.
3. Create a Google Sheet using the headers described in `automation/README.md`.
4. Add your AI caption/image-generation nodes and connect them to the included publishing sequence, or follow the documented workflow.
5. Test with a private/test account or approved test content before activating the daily schedule.
6. Meta publishing requires a supported Instagram professional account, app permissions and a publicly accessible image URL. API field names/permissions can change; verify against current Meta docs.

## E. Security notes
- Never put Firebase service-account JSON, Meta access tokens, Gemini API keys, or payment secrets in source code or GitHub.
- Do not trust client-supplied prices or role fields for orders. For production, create orders and verify payments in trusted server-side code.
- The sample app creates unpaid orders; it does not claim a payment is complete.
- Configure real payment processing only in test mode first.
