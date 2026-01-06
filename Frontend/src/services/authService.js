const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:4000";

/**
 * Authenticates a user by posting credentials to the backend
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
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: enteredUsername.trim(),
        password: enteredPassword,
        userType,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        user: null,
        error: data?.error || "Invalid username/email or password",
      };
    }

    const user = data.user || {};
    const resolvedUserType =
      user.userType || user.user_type || user.role || userType;

    // Store user data in localStorage for session management
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: user.id,
        username: user.Username || user.Email,
        email: user.Email,
        userType: resolvedUserType,
        ...user,
      }),
    );

    return {
      success: true,
      user,
      error: null,
    };
  } catch (error) {
    console.error("Login request error:", error);
    return {
      success: false,
      user: null,
      error: "An error occurred during login. Please try again.",
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

