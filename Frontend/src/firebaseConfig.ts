import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDllJ3djkebxHZxHlcp6w54goiDMsXiaS8",
  authDomain: "motospherebsit3b.firebaseapp.com",
  projectId: "motospherebsit3b",
  storageBucket: "motospherebsit3b.firebasestorage.app",
  messagingSenderId: "242798297710",
  appId: "1:242798297710:web:d3fc87b62527d1deb95c7f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
