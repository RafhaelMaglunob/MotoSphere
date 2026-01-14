# MotoSphere Backend API

Backend API for MotoSphere - Smart Helmet System

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the Backend directory (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Go to Project Settings > Service Accounts
   - Generate a new private key (downloads JSON file)
   - Choose one of these options to configure:
     - **Option 1 (Recommended)**: Base64 encode the service account JSON and set `FIREBASE_SERVICE_ACCOUNT_KEY`
     - **Option 2**: Set `FIREBASE_SERVICE_ACCOUNT_PATH` to the path of your service account JSON file
     - **Option 3**: Extract values from JSON and set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `FIREBASE_DATABASE_URL`

4. Update the `.env` file with your configuration:
   - Configure Firebase credentials (see step 3)
   - Set `JWT_SECRET` to a secure random string
   - Set `FRONTEND_URL` to your frontend URL

5. Create an admin user:
```bash
npm run create-admin
```

6. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication

#### User Registration
- **POST** `/api/auth/register`
- Body: `{ username, email, contactNo, password, confirmPassword }`
- Returns: `{ success, message, token, user }`

#### User Login
- **POST** `/api/auth/login`
- Body: `{ email, password }` (email can be email or username)
- Returns: `{ success, message, token, user }`

#### Admin Login
- **POST** `/api/auth/admin/login`
- Body: `{ email, password }` (email can be email or username)
- Returns: `{ success, message, token, user }`

#### Verify Token
- **GET** `/api/auth/verify`
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, user }`

### Protected Routes

#### Protected Example
- **GET** `/api/protected`
- Headers: `Authorization: Bearer <token>`
- Returns: `{ message, user }`

## Environment Variables

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Base64 encoded Firebase service account JSON (Option 1)
- `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to Firebase service account JSON file (Option 2)
- `FIREBASE_PROJECT_ID`: Firebase project ID (Option 3)
- `FIREBASE_CLIENT_EMAIL`: Firebase service account email (Option 3)
- `FIREBASE_PRIVATE_KEY`: Firebase private key (Option 3)
- `FIREBASE_DATABASE_URL`: Firebase database URL (Option 3)
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time (default: 7d)
- `FRONTEND_URL`: Frontend URL for CORS

## Database Models

### User (Firestore Collection: `users`)
- `username`: String (unique, required, 3-30 chars, alphanumeric + spaces)
- `email`: String (unique, required, must end with gmail.com, yahoo.com, or hotmail.com)
- `contactNo`: String (required, format: 09XXXXXXXXX - 11 digits starting with 09)
- `password`: String (hashed with bcrypt, required, 8-15 chars, must include uppercase, number, and special char)
- `role`: String (enum: 'user', 'admin', default: 'user')
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## Validation Rules

### User Registration
- **Username**: 3-30 characters, letters, numbers, and spaces only
- **Email**: Must match pattern `[A-Za-z0-9_]+@(gmail\.com|yahoo\.com|hotmail\.com)`
- **Contact Number**: Must start with `09` and be exactly 11 digits
- **Password**: 8-15 characters, must include:
  - At least one uppercase letter
  - At least one number
  - At least one special character
- **Confirm Password**: Must match password exactly

### User/Admin Login
- **Email/Username**: Required, cannot be empty
- **Password**: Required, cannot be empty
- Returns generic error message for security: "Invalid email/username or password"

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- CORS configuration
- Input validation
- Error handling middleware
