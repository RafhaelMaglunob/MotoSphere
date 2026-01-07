# Backend Environment Setup

## Environment Variables

Create a `.env` file in the `Backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/motosphere

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration (Frontend URL)
CORS_ORIGIN=http://localhost:5173
```

## Installation

1. Install dependencies:
```bash
cd Backend
npm install
```

2. Create the `.env` file with the configuration above

3. Make sure MongoDB is running on your system:
   - **Windows**: MongoDB should be running as a service
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

4. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend will be available at `http://localhost:5000`

## MongoDB Setup

If MongoDB is not installed:

### Windows
Download and install from: https://www.mongodb.com/try/download/community

### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install -y mongodb
```

## Troubleshooting

If you get a MongoDB connection error:
1. Make sure MongoDB is running
2. Check if the port 27017 is available
3. Verify your MongoDB URI in the `.env` file

