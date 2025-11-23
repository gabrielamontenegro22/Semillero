// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  // 👈 Importamos Firestore

const firebaseConfig = {
  apiKey: "AIzaSyB8HJVrPO7rDakvRZnXAsIGbFslZbdjYnA",
  authDomain: "play-english-33b0f.firebaseapp.com",
  projectId: "play-english-33b0f",
  storageBucket: "play-english-33b0f.appspot.com",
  messagingSenderId: "204283320342",
  appId: "1:204283320342:web:f5d79d8e98713b30983d37"
};

// 🔹 Inicializa la app
const app = initializeApp(firebaseConfig);

// 🔹 Exporta Authentication y Firestore
export const auth = getAuth(app);
export const db = getFirestore(app); // 👈 Agregado
