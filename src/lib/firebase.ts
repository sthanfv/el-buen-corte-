// src/lib/firebase.ts (SERVER-SIDE ONLY)
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const projectId =
      process.env.FIREBASE_ADMIN_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    let cert;

    if (privateKey && clientEmail && projectId) {
      // Option A: Individual Vars (Proven to work)
      cert = {
        projectId,
        clientEmail,
        // Handle escaped newlines from .env (e.g. `\\n` to `\n`)
        privateKey: privateKey.replace(/\\n/g, '\n'),
      };
      console.log('Firebase Admin initialized with individual vars.');
    } else if (serviceAccountJson) {
      // Option B: JSON Blob (Fallback)
      cert = JSON.parse(serviceAccountJson);
      console.log('Firebase Admin initialized with JSON var.');
    } else {
      throw new Error(
        'Missing Firebase Admin Credentials (FIREBASE_ADMIN_PRIVATE_KEY or JSON).'
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert(cert),
    });
  } catch (e) {
    console.error('Firebase admin initialization error', e);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
