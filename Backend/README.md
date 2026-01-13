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

3. Update the `.env` file with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Set `FRONTEND_URL` to your frontend URL

4. Make sure MongoDB is running on your system or use MongoDB Atlas

5. Start the server:
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
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time (default: 7d)
- `FRONTEND_URL`: Frontend URL for CORS

## Database Models

### User
- `username`: String (unique, required)
- `email`: String (unique, required)
- `contactNo`: String (required, format: 09XXXXXXXXX)
- `password`: String (hashed, required)
- `role`: String (enum: 'user', 'admin', default: 'user')
- `createdAt`: Date
- `updatedAt`: Date

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- CORS configuration
- Input validation
- Error handling middleware
