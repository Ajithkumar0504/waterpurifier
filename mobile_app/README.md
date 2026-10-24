# Califnco Water Purifier — Flutter Mobile App

This is the customer & dealer shopping mobile application for Califnco water purifiers.

## Features
- **Authentication**: Customer & Dealer account registration and login via Firebase Auth.
- **Product Catalog**: 50+ water purifiers, RO/UV units, spare parts, and filters.
- **Dual Pricing**: Automatic wholesale price display for verified & approved dealers.
- **Cart & Orders**: Cart management and order placement (recorded in Firestore `orders`).
- **Service Booking**: Water purifier repair and filter replacement request form.

## Getting Started

### 1. Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (version 3.3.0 or higher)
- Android Studio with Android SDK & Emulator (or physical Android device with USB debugging)

### 2. Scaffold Platform Folders (if missing)
Run inside the `mobile_app` folder:
```bash
flutter create . --org com.califnco
```

### 3. Install Dependencies
```bash
flutter pub get
```

### 4. Configure Firebase
Install FlutterFire CLI if you haven't already:
```bash
dart pub global activate flutterfire_cli
flutterfire configure
```
This updates `lib/firebase_options.dart` with your real Firebase Project details.

### 5. Run the App
```bash
flutter run
```
