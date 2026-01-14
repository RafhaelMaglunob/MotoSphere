import dotenv from 'dotenv';
import '../config/firebase.js'; // Initialize Firebase
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    console.log('🔍 Checking for existing admin user...');

    // Check if admin already exists
    const existingAdmin = await User.findAdminForLogin('admin@motosphere.com');
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log(`📧 Email: ${existingAdmin.email}`);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@motosphere.com',
      contactNo: '09123456789',
      password: 'Admin@123', // Change this password after first login
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@motosphere.com');
    console.log('🔑 Password: Admin@123');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
