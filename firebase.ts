
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

export { auth, db };
