'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getRemoteConfig, type RemoteConfig } from 'firebase/remote-config';
import firebaseConfig from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;
let remoteConfig: RemoteConfig | null = null;

if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

auth = getAuth(firebaseApp);
db = getFirestore(firebaseApp);

if (typeof window !== 'undefined') {
  remoteConfig = getRemoteConfig(firebaseApp);
  remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hora
  remoteConfig.defaultConfig = {
    'enable_sales_bot': true,
    'enable_promo_banner': false,
    'enable_cart_killswitch': true
  };
}

export { firebaseApp, auth, db, remoteConfig };
