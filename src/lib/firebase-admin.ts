
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey);

    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.STORAGE_BUCKET_URL,
      });
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore();

  } else {
    const errorMessage = 'CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin features are disabled.';
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMessage);
    } else {
      console.warn(errorMessage + ' This is a warning in development mode.');
    }
  }
} catch (error: any) {
  const errorMessage = `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it's a valid JSON string. Details: ${error.message}`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(errorMessage);
  } else {
    console.error(errorMessage + ' This is a warning in development mode.');
  }
}

export { auth, db };
