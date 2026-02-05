
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  enableIndexedDbPersistence,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence (IndexedDB for better offline support)
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('✓ Firestore offline persistence enabled');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠ Multiple tabs open - offline persistence disabled in some tabs');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠ Browser does not support offline persistence');
    } else {
      console.error('✗ Error enabling offline persistence:', err);
    }
  });

// Sign in with Google popup helper
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result;
};

export { auth, db };

// Export type for internal use
export interface FirestoreUserData {
  data: any;
  updatedAt: any;
}

// Firestore helpers for storing user app data
// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // ms

export const fetchUserData = async (uid: string): Promise<any | null> => {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const payload = snap.data();
    return payload?.data ?? null;
  } catch (error) {
    console.error('✗ fetchUserData error:', error);
    return null;
  }
};

export const getLastUpdateTimestamp = async (uid: string): Promise<number | null> => {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const payload = snap.data();
    // Firestore Timestamp object needs conversion
    const timestamp = payload?.updatedAt;
    if (timestamp && typeof timestamp.toMillis === 'function') {
      return timestamp.toMillis();
    }
    return null;
  } catch (error) {
    console.error('✗ getLastUpdateTimestamp error:', error);
    return null;
  }
};

// Save with retry logic for network resilience
export const saveUserData = async (
  uid: string,
  data: any,
  retryCount: number = 0
): Promise<void> => {
  try {
    const ref = doc(db, 'users', uid);
    await setDoc(
      ref,
      {
        data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log('✓ User data saved successfully');
  } catch (error: any) {
    // Network errors and quota exceeded errors are retryable
    const isRetryable =
      error?.code === 'unavailable' ||
      error?.code === 'resource-exhausted' ||
      error?.code === 'deadline-exceeded' ||
      error?.message?.includes('Failed to get document');

    if (isRetryable && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.warn(
        `⚠ Save failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return saveUserData(uid, data, retryCount + 1);
    }

    console.error('✗ saveUserData error (final):', error);
    throw error;
  }
};
