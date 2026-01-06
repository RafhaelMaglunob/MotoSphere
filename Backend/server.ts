import "dotenv/config";
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import { loginWithFirestore } from "./login";

// Initialize Firebase Admin using environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing Firebase admin credentials. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
  );
  process.exit(1);
}

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/login", async (req, res) => {
  const { identifier, password, userType } = req.body || {};

  const result = await loginWithFirestore({
    identifier,
    password,
    userType,
  });

  if (result.success) {
    return res.json({ success: true, user: result.user });
  }

  return res.status(401).json({
    success: false,
    error: result.error ?? "Authentication failed",
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth server listening on port ${PORT}`);
});

