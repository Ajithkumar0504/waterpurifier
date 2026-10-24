// File configured for califnco-water-purifier-1f615
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDSWiZ3MZUrRpLY09qzQ8L1LV7bV9qACjE',
    appId: '1:473669075579:web:8caa6315c2e2329d2358de',
    messagingSenderId: '473669075579',
    projectId: 'califnco-water-purifier-1f615',
    authDomain: 'califnco-water-purifier-1f615.firebaseapp.com',
    storageBucket: 'califnco-water-purifier-1f615.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDSWiZ3MZUrRpLY09qzQ8L1LV7bV9qACjE',
    appId: '1:473669075579:web:8caa6315c2e2329d2358de',
    messagingSenderId: '473669075579',
    projectId: 'califnco-water-purifier-1f615',
    storageBucket: 'califnco-water-purifier-1f615.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyDSWiZ3MZUrRpLY09qzQ8L1LV7bV9qACjE',
    appId: '1:473669075579:web:8caa6315c2e2329d2358de',
    messagingSenderId: '473669075579',
    projectId: 'califnco-water-purifier-1f615',
    storageBucket: 'califnco-water-purifier-1f615.firebasestorage.app',
    iosBundleId: 'com.califnco.waterpurifier',
  );
}
