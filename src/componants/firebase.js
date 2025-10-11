import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "",
  authDomain: "church-9a10e.firebaseapp.com",
  projectId: "church-9a10e",
  storageBucket: "church-9a10e.firebasestorage.app",
  messagingSenderId: "237535800455",
  appId: "1:237535800455:web:82078968b05a413a199c22",
  measurementId: "G-B65174D7EH",
  DataBaseURL: "https://church-9a10e-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you need
export const authService = getAuth(app);
export const db = getDatabase(app);

export const authMethod = {
  ...authService,
  createUserWithEmailAndPassword: (email, password) =>
    createUserWithEmailAndPassword(authService, email, password),
};
