import dotenv from 'dotenv';
import '../config/firebase.js'; // Initialize Firebase
import User from '../models/User.js';

dotenv.config();

const updateUserRole = async () => {
  try {
    const email = process.argv[2];
    const newRole = process.argv[3];
    
    if (!email || !newRole) {
      console.error('❌ Please provide email and role');
      console.log('\nUsage:');
      console.log('  node scripts/updateUserRole.js <email> <role>');
      console.log('\nExample:');
      console.log('  node scripts/updateUserRole.js user@gmail.com admin');
      console.log('  node scripts/updateUserRole.js user@gmail.com user');
      process.exit(1);
    }

    if (!['admin', 'user'].includes(newRole.toLowerCase())) {
      console.error(`❌ Invalid role. Must be "admin" or "user", got: "${newRole}"`);
      process.exit(1);
    }

    console.log(`🔍 Finding user: ${email}`);

    // Find user by email
    const user = await User.findByEmailOrUsername(email, null);

    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    console.log(`\n📋 Current Details:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: "${user.role}"`);

    // Update role
    console.log(`\n🔄 Updating role to: "${newRole}"`);
    await User.update(user.id, { role: newRole.toLowerCase() });

    // Verify update
    const updatedUser = await User.findById(user.id);
    console.log(`\n✅ Role updated successfully!`);
    console.log(`   New Role: "${updatedUser.role}"`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateUserRole();
