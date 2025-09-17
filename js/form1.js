// script.js

// --- Firebase imports (ESM) ---
import {
  initializeApp, getApps, getApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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

// --- Your Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyDWH3LoCvRmTUMthsUsIA0MBiqZ4NmFyco",
  authDomain: "ecome-72c36.firebaseapp.com",
  projectId: "ecome-72c36",
  storageBucket: "ecome-72c36.firebasestorage.app",
  messagingSenderId: "880319220349",
  appId: "1:880319220349:web:4af4666ec90587a23dbf14",
  measurementId: "G-PCHS3RPXD4"
};

// --- Safe init ---
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Analytics (wrapped, no top-level await) ---
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
  const offcanvas = document.getElementById('offcanvasLoginRegister');
  const loginFormWrapper = document.getElementById('login-form-wrapper');
  const registerFormWrapper = document.getElementById('register-form-wrapper');
  const loggedInWrapper = document.getElementById('logged-in-wrapper');
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const userNameDisplay = document.getElementById('user-name-display');
  const logoutBtn = document.getElementById('logout-btn');
  const accountIcon = document.getElementById('account-icon');

  // --- Form Toggle Logic ---
  const toggleButtons = offcanvas.querySelectorAll('.toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetFormId = btn.getAttribute('data-target');
      if (targetFormId === 'register-form-wrapper') {
        loginFormWrapper.classList.add('d-none');
        registerFormWrapper.classList.remove('d-none');
      } else {
        registerFormWrapper.classList.add('d-none');
        loginFormWrapper.classList.remove('d-none');
      }
    });
  });

  // --- Auth State Listener ---
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        userNameDisplay.textContent = snap.exists() ? (snap.data().name || user.email) : user.email;
      } catch {
        userNameDisplay.textContent = user.email;
      }

      accountIcon.classList.remove('bg-light');
      accountIcon.classList.add('bg-success');
      loginFormWrapper.classList.add('d-none');
      registerFormWrapper.classList.add('d-none');
      loggedInWrapper.classList.remove('d-none');
    } else {
      accountIcon.classList.remove('bg-success');
      accountIcon.classList.add('bg-light');
      loggedInWrapper.classList.add('d-none');
      loginFormWrapper.classList.remove('d-none');
    }
  });

  // --- Registration ---
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), { name, email });
    } catch (err) {
      console.error('Registration error:', err.message);
      const pf = document.getElementById('password-feedback');
      if (pf) {
        pf.textContent = `Registration failed: ${err.message}`;
        pf.classList.add('text-danger');
      }
    }
  });

  // --- Login ---
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Login error:', err.message);
      const pf = document.getElementById('password-feedback');
      if (pf) {
        pf.textContent = `Login failed: ${err.message}`;
        pf.classList.add('text-danger');
      }
    }
  });

  // --- Logout ---
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      registerForm.reset();
      loginForm.reset();
      const pf = document.getElementById('password-feedback');
      if (pf) pf.textContent = '';
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  });

  // --- Password Generator (Gemini API) ---
  const generatePasswordBtn = document.getElementById('generate-password-btn');
  const registerPasswordInput = document.getElementById('register-password');
  const passwordFeedback = document.getElementById('password-feedback');

  if (generatePasswordBtn && registerPasswordInput) {
    generatePasswordBtn.addEventListener('click', async () => {
      const prompt = "Generate a strong password 12-16 characters long with upper, lower, numbers, symbols. Reply with password only.";
      passwordFeedback.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Generating...`;
      passwordFeedback.classList.remove('text-danger');
      passwordFeedback.classList.add('text-primary');

      let generatedPassword = null;
      try {
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        const apiKey = ""; // your Gemini API key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.candidates?.length > 0) {
          generatedPassword = result.candidates[0].content.parts[0].text.trim();
        }
      } catch (e) {
        console.error(e);
      }

      passwordFeedback.innerHTML = '';
      if (generatedPassword) {
        registerPasswordInput.value = generatedPassword;
        passwordFeedback.textContent = 'Password generated!';
        passwordFeedback.classList.add('text-success');
      } else {
        passwordFeedback.textContent = 'Failed to generate password. Please try again.';
        passwordFeedback.classList.add('text-danger');
      }
    });
  }
});
