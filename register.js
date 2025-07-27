import {
  auth,
  db,
  createUserWithEmailAndPassword,
  doc,
  setDoc
} from './firebase-config.js';

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    // Create the user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      createdAt: new Date().toISOString(),
      location: null,
      jamatTimings: {},
    });

    alert('Registration successful!');
    window.location.href = 'dashboard.html';

  } catch (error) {
    console.error('Registration error:', error.message);
    alert(`Registration failed: ${error.message}`);
  }
});
