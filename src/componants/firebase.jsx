import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.REACT_APP_API_KEY,
  authDomain: import.meta.env.REACT_APP_AUTH_DOMAIN,
  projectId: import.meta.env.REACT_APP_PROJECT_ID,
  storageBucket: import.meta.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.REACT_APP_APP_ID,
  measurementId:import.meta.env.REACT_APP_MEASUREMENT_ID,
  DataBaseURL: import.meta.env.REACT_APP_DATABASE_URL,
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
