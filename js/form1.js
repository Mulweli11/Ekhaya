// --- Firebase imports (ESM) ---
import {
  initializeApp, getApps, getApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getAnalytics,
  isSupported as analyticsIsSupported
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyDWH3LoCvRmTUMthsUsIA0MBiqZ4NmFyco",
  authDomain: "ecome-72c36.firebaseapp.com",
  projectId: "ecome-72c36",
  storageBucket: "ecome-72c36.firebasestorage.app",
  messagingSenderId: "880319220349",
  appId: "1:880319220349:web:4af4666ec90587a23dbf14",
  measurementId: "G-PCHS3RPXD4"
};

// --- Initialize Firebase ---
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Optional Analytics ---
(async () => {
  try {
    const supported = await analyticsIsSupported();
    if (supported) getAnalytics(app);
  } catch (e) {
    console.warn("Analytics not supported:", e.message);
  }
})();

// ---------------------------------------------------------------------
// MAIN APP LOGIC
// ---------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const loginFormWrapper = document.getElementById('login-form-wrapper');
  const registerFormWrapper = document.getElementById('register-form-wrapper');
  const loggedInWrapper = document.getElementById('logged-in-wrapper');
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const userNameDisplay = document.getElementById('user-name-display');
  const logoutBtn = document.getElementById('logout-btn');
  const forgotPasswordBtn = document.getElementById('forgot-password-btn');

  // --- Toggle between login/register ---
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      loginFormWrapper.classList.toggle('d-none', target === 'register-form-wrapper');
      registerFormWrapper.classList.toggle('d-none', target !== 'register-form-wrapper');
    });
  });

  // --- Auth State ---
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      userNameDisplay.textContent = userDoc.exists() ? (userDoc.data().name || user.email) : user.email;

      loginFormWrapper.classList.add('d-none');
      registerFormWrapper.classList.add('d-none');
      loggedInWrapper.classList.remove('d-none');
    } else {
      loggedInWrapper.classList.add('d-none');
      loginFormWrapper.classList.remove('d-none');
    }
  });

  // --- Register ---
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-password-confirm').value;
    const feedback = document.getElementById('password-feedback');

    if (password !== confirm) {
      feedback.textContent = 'Passwords do not match.';
      feedback.classList.add('text-danger');
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCred.user.uid), { name, email });
      feedback.textContent = 'Registration successful!';
      feedback.classList.add('text-success');
    } catch (err) {
      feedback.textContent = `Error: ${err.message}`;
      feedback.classList.add('text-danger');
    }
  });

  // --- Login ---
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    }
  });

  // --- Forgot Password ---
  forgotPasswordBtn.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  });

  // --- Logout ---
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    loginForm.reset();
    registerForm.reset();
  });

  // --- Password Generator (Gemini optional) ---
  const generatePasswordBtn = document.getElementById('generate-password-btn');
  const registerPasswordInput = document.getElementById('register-password');
  const passwordFeedback = document.getElementById('password-feedback');

  generatePasswordBtn.addEventListener('click', () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < 14; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
    registerPasswordInput.value = password;
    passwordFeedback.textContent = "Password generated!";
    passwordFeedback.classList.add('text-success');
  });
});
