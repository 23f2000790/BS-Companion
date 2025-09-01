// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyChmKC1WHIt_NdbMRzQfJmY-fqakL9cqRA",
  authDomain: "bs-companion.firebaseapp.com",
  projectId: "bs-companion",
  storageBucket: "bs-companion.firebasestorage.app",
  messagingSenderId: "554450407731",
  appId: "1:554450407731:web:bbb17ac90ba5f1b410ae46",
  measurementId: "G-DRF96GTX9H",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};
