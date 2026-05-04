// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_RBr50i6bfC-wX43QeG1OZXxBe3Cg07g",
  authDomain: "royal-creation-billing.firebaseapp.com",
  projectId: "royal-creation-billing",
  storageBucket: "royal-creation-billing.firebasestorage.app",
  messagingSenderId: "618534962208",
  appId: "1:618534962208:web:5ace80ef46103d02dc2845"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('email');
googleProvider.addScope('profile');
