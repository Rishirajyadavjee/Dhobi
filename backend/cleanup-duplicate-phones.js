import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/User.js';

dotenv.config();

async function deduplicatePhones() {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Checking for duplicate phone numbers...');

    const users = await User.find({ phone: { $exists: true, $ne: null, $ne: '' } });
    console.log(`Found ${users.length} users with phone numbers.`);

    const phoneMap = new Map();
    let deduplicatedCount = 0;

    for (const user of users) {
      const cleanPhone = user.phone.replace(/\D/g, '');
      if (phoneMap.has(cleanPhone)) {
        // This is a duplicate!
        // If it's a test-payment user or duplicate dummy user, update with a unique suffix or distinct number
        deduplicatedCount++;
        const newPhone = `${cleanPhone.slice(0, 6)}${Math.floor(1000 + Math.random() * 9000)}`;
        console.log(`Updating duplicate phone for user ${user.email} (${user._id}): ${user.phone} -> ${newPhone}`);
        user.phone = newPhone;
        await user.save();
      } else {
        phoneMap.set(cleanPhone, user._id);
        if (user.phone !== cleanPhone) {
          user.phone = cleanPhone;
          await user.save();
        }
      }
    }

    console.log(`Deduplication finished. ${deduplicatedCount} duplicate phones updated.`);

    // Drop any existing problematic indexes and rebuild unique indexes
    try {
      await User.collection.dropIndex('phone_1');
      console.log('Dropped old phone_1 index.');
    } catch (e) {
      // index might not exist
    }

    await User.collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
    console.log('Successfully created unique sparse index on phone!');

    const finalUsers = await User.find({}, 'name email phone role');
    console.log('Final users phone check:', finalUsers.map(u => ({ email: u.email, phone: u.phone })));

    process.exit(0);
  } catch (err) {
    console.error('Error during phone deduplication:', err);
    process.exit(1);
  }
}

deduplicatePhones();
