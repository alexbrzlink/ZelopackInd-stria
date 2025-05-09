// Firebase authentication functions
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Initialize Firebase auth
const auth = getAuth();

// Login function
export function loginWithEmailAndPassword(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Login successful, return user
      return userCredential.user;
    })
    .catch((error) => {
      // Handle errors
      console.error("Login error:", error.code, error.message);
      throw error;
    });
}

// Register function
export function registerWithEmailAndPassword(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Registration successful, return user
      return userCredential.user;
    })
    .catch((error) => {
      // Handle errors
      console.error("Registration error:", error.code, error.message);
      throw error;
    });
}

// Password reset function
export function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email)
    .then(() => {
      // Password reset email sent
      return true;
    })
    .catch((error) => {
      // Handle errors
      console.error("Password reset error:", error.code, error.message);
      throw error;
    });
}

// Logout function
export function logoutUser() {
  return signOut(auth)
    .then(() => {
      // Sign-out successful
      return true;
    })
    .catch((error) => {
      // Handle errors
      console.error("Logout error:", error.code, error.message);
      throw error;
    });
}
