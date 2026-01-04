import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Authenticates a user by checking credentials against Firebase Firestore
 * @param {string} enteredUsername - The username or email entered by the user
 * @param {string} enteredPassword - The password entered by the user
 * @param {string} userType - 'user' or 'admin' to determine which collection to check
 * @returns {Promise<{success: boolean, user: object|null, error: string|null}>}
 */
export async function login(enteredUsername, enteredPassword, userType = 'user') {
  // Validation
  if (!enteredUsername || !enteredPassword) {
    return {
      success: false,
      user: null,
      error: "Please fill in all fields"
    };
  }

  if (enteredUsername.trim() === "" || enteredPassword.trim() === "") {
    return {
      success: false,
      user: null,
      error: "Username and password cannot be empty"
    };
  }

  try {
    // Determine which collection to query
    const collectionName = userType === 'admin' ? 'Admins' : 'Users';
    const usersRef = collection(db, collectionName);
    
    let matchingUser = null;
    const trimmedUsername = enteredUsername.trim();
    
    try {
      // Try to use Firestore queries first (more efficient)
      const usernameQuery = query(usersRef, where('Username', '==', trimmedUsername));
      const emailQuery = query(usersRef, where('Email', '==', trimmedUsername));
      
      // Execute both queries
      const [usernameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(usernameQuery),
        getDocs(emailQuery)
      ]);

      // Check username matches
      if (!usernameSnapshot.empty) {
        usernameSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.Password === enteredPassword) {
            matchingUser = { id: doc.id, ...data };
          }
        });
      }
      
      // Check email matches if username didn't match
      if (!matchingUser && !emailSnapshot.empty) {
        emailSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.Password === enteredPassword) {
            matchingUser = { id: doc.id, ...data };
          }
        });
      }
    } catch (queryError) {
      // Fallback: If queries fail (e.g., missing indexes), fetch all documents
      console.warn("Query failed, falling back to fetching all documents:", queryError);
      const snapshot = await getDocs(usersRef);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const usernameMatch = data.Username === trimmedUsername;
        const emailMatch = data.Email === trimmedUsername;
        const passwordMatch = data.Password === enteredPassword;
        
        if ((usernameMatch || emailMatch) && passwordMatch) {
          matchingUser = { id: doc.id, ...data };
        }
      });
    }

    if (matchingUser) {
      // Store user data in localStorage for session management
      localStorage.setItem('currentUser', JSON.stringify({
        id: matchingUser.id,
        username: matchingUser.Username || matchingUser.Email,
        email: matchingUser.Email,
        userType: userType,
        ...matchingUser
      }));
      
      return {
        success: true,
        user: matchingUser,
        error: null
      };
    } else {
      return {
        success: false,
        user: null,
        error: "Invalid username/email or password"
      };
    }

  } catch (error) {
    console.error("Firestore error:", error);
    return {
      success: false,
      user: null,
      error: "An error occurred during login. Please try again."
    };
  }
}

/**
 * Logs out the current user by clearing localStorage
 */
export function logout() {
  localStorage.removeItem('currentUser');
}

/**
 * Gets the current logged-in user from localStorage
 * @returns {object|null}
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  }
  return null;
}

/**
 * Checks if a user is currently logged in
 * @returns {boolean}
 */
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

