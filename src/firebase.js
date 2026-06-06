import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCxf4YaaDjialqXG6njBhfBwHpzLOiVKyQ",
  authDomain: "dudu-pereira.firebaseapp.com",
  projectId: "dudu-pereira",
  storageBucket: "dudu-pereira.firebasestorage.app",
  messagingSenderId: "926229022308",
  appId: "1:926229022308:web:f67f0c6b3136c36ae50171"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
