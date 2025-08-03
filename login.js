// login.js

import {
  auth,
  signInWithEmailAndPassword
} from "./firebase-config.js";

// Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorBox = document.getElementById("errorBox");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Redirect to dashboard on success
    window.location.href = "dashboard.html";
  } catch (error) {
    showError(error.message);
  }
});

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}
