import dotenv from 'dotenv';
import '../config/firebase.js'; // Initialize Firebase
import User from '../models/User.js';

dotenv.config();

const checkUserRole = async () => {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('\nUsage:');
      console.log('  node scripts/checkUserRole.js <email>');
      console.log('\nExample:');
      console.log('  node scripts/checkUserRole.js user@gmail.com');
      process.exit(1);
    }

    console.log(`🔍 Checking role for: ${email}`);

    // Find user by email
    const user = await User.findByEmailOrUsername(email, null);

    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    console.log('\n📋 User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: "${user.role}" (type: ${typeof user.role})`);
    console.log(`   Role (trimmed): "${user.role ? user.role.toString().trim() : 'null'}"`);
    console.log(`   Role (lowercase): "${user.role ? user.role.toString().trim().toLowerCase() : 'null'}"`);
    console.log(`   Is Admin: ${user.role ? user.role.toString().trim().toLowerCase() === 'admin' : false}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUserRole();
