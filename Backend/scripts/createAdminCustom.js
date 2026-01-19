import dotenv from 'dotenv';
import '../config/firebase.js'; // Initialize Firebase
import User from '../models/User.js';

dotenv.config();

// Get command line arguments
const args = process.argv.slice(2);

// Parse arguments
const getArg = (flag) => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
};

const createAdmin = async () => {
  try {
    // Get admin details from command line arguments
    const username = getArg('--username') || getArg('-u');
    const email = getArg('--email') || getArg('-e');
    const password = getArg('--password') || getArg('-p');
    const contactNo = getArg('--contact') || getArg('-c') || '09123456789';

    // Validate required fields
    if (!username) {
      console.error('❌ Username is required!');
      console.log('\nUsage:');
      console.log('  npm run create-admin-custom -- --username <username> --email <email> --password <password> [--contact <contactNo>]');
      console.log('\nExample:');
      console.log('  npm run create-admin-custom -- --username admin2 --email admin2@gmail.com --password Admin@123');
      process.exit(1);
    }

    if (!email) {
      console.error('❌ Email is required!');
      console.log('\nUsage:');
      console.log('  npm run create-admin-custom -- --username <username> --email <email> --password <password> [--contact <contactNo>]');
      process.exit(1);
    }

    if (!password) {
      console.error('❌ Password is required!');
      console.log('\nUsage:');
      console.log('  npm run create-admin-custom -- --username <username> --email <email> --password <password> [--contact <contactNo>]');
      process.exit(1);
    }

    console.log('🔍 Checking for existing admin user...');

    // Check if admin already exists
    const existingAdmin = await User.findAdminForLogin(email);
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with this email/username');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Username: ${existingAdmin.username}`);
      process.exit(0);
    }

    // Check if username is taken
    const existingUser = await User.findByEmailOrUsername(email, username);
    if (existingUser) {
      console.log('⚠️  User already exists with this email or username');
      console.log(`📧 Email: ${existingUser.email}`);
      console.log(`👤 Username: ${existingUser.username}`);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      username: username,
      email: email,
      contactNo: contactNo,
      password: password,
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log(`👤 Username: ${admin.username}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`📱 Contact: ${contactNo}`);
    console.log(`🔑 Password: ${password}`);
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
