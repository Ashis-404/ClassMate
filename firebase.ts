
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAez6M72dog0-nDvFcVtGGTvUigVUN7WX4",
  authDomain: "classmate-70499191-5333b.firebaseapp.com",
  projectId: "classmate-70499191-5333b",
  storageBucket: "classmate-70499191-5333b.appspot.com",
  messagingSenderId: "792080119396",
  appId: "1:792080119396:web:475af6ce4358ae6bf81171"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sign in with Google popup helper
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result;
};

export { auth, db };

// Firestore helpers for storing user app data
export const fetchUserData = async (uid: string) => {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const payload = snap.data();
    return payload?.data ?? null;
  } catch (error) {
    console.error('fetchUserData error', error);
    return null;
  }
};

export const saveUserData = async (uid: string, data: any) => {
  try {
    const ref = doc(db, 'users', uid);
    await setDoc(ref, { data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('saveUserData error', error);
    throw error;
  }
};
