import admin from "firebase-admin";

export type UserType = "user" | "admin";

export interface LoginInput {
  identifier: string; // username or email
  password: string;
  userType?: UserType;
}

export interface LoginResult {
  success: boolean;
  user?: Record<string, unknown>;
  error?: string;
}

/**
 * Server-side login using Firebase Admin SDK.
 * Looks up by Username OR Email in the target collection, then checks Password.
 */
export async function loginWithFirestore({
  identifier,
  password,
  userType = "user",
}: LoginInput): Promise<LoginResult> {
  if (!identifier?.trim() || !password?.trim()) {
    return { success: false, error: "Please fill in all fields" };
  }

  // For "user" logins, only check Users.
  // For "admin" logins, only check Admins.
  const collectionName = userType === "admin" ? "Admins" : "Users";
  const db = admin.firestore();
  const trimmed = identifier.trim();

  async function findUser() {
    // Query by Username
    const usernameSnap = await db
      .collection(collectionName)
      .where("Username", "==", trimmed)
      .limit(1)
      .get();

    let docSnap = !usernameSnap.empty ? usernameSnap.docs[0] : undefined;

    // If not found, query by Email
    if (!docSnap) {
      const emailSnap = await db
        .collection(collectionName)
        .where("Email", "==", trimmed)
        .limit(1)
        .get();
      if (!emailSnap.empty) {
        docSnap = emailSnap.docs[0];
      }
    }

    return docSnap;
  }

  try {
    const docSnap = await findUser();

    if (!docSnap) {
      return { success: false, error: "Invalid username/email or password" };
    }

    const data = docSnap.data();
    const passwordMatch = data?.Password === password;

    if (!passwordMatch) {
      return { success: false, error: "Invalid username/email or password" };
    }

    // Determine effective user type based on the role field in the document
    // Check for role field (case-insensitive): "admin", "Admin", "ADMIN", etc.
    const role = String(data?.role || data?.Role || "").toLowerCase();
    const effectiveUserType: UserType = role === "admin" ? "admin" : "user";

    // Sanitize sensitive fields if needed
    const { Password, ...safeUser } = data || {};

    return {
      success: true,
      user: {
        id: docSnap.id,
        userType: effectiveUserType,
        role: role || "user",
        ...safeUser,
      },
    };
  } catch (error) {
    console.error("Firestore login error:", error);
    return { success: false, error: "Server error. Please try again." };
  }
}
