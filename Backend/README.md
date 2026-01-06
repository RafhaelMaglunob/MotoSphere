# MotoSphere Backend (Auth)

Minimal Express + Firebase Admin server for credential checks against Firestore.

## Setup
1) In `Backend/`, install deps:
```
npm install
```

2) Create a `.env` file (same folder) with:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
PORT=4000
```
> If the private key comes from JSON, wrap it in quotes and keep `\n`.

3) Run the server:
```
npm run dev
```
It starts on `http://localhost:4000`.

## API
- `POST /login`
  - body: `{ "identifier": "username or email", "password": "plainText", "userType": "user|admin" }`
  - success: `{ success: true, user: {...} }`
  - failure: `{ success: false, error: "message" }` (HTTP 401)

## Collections
- Users: `Users` collection with fields `Username`, `Email`, `Password`
- Admins: `Admins` collection with the same fields

## Notes
- This uses the Firebase Admin SDK (server-side) so credentials are not exposed to the client.
- Frontend calls `http://localhost:4000/login` (configurable via `VITE_API_URL`).
