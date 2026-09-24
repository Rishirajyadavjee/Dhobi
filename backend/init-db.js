/**
 * MongoDB Seed Script
 * Run with: node init-db.js
 *
 * Creates default admin, dhobi, and user accounts.
 * Passwords:
 *   admin@dhobi.com  → admin123
 *   ramesh@dhobi.com → dhobi123
 *   user@dhobi.com   → user123
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'dhobi_service'
    });
    console.log('✅ Connected to MongoDB');

    const seedUsers = [
      {
        name: 'Admin User',
        email: 'admin@dhobi.com',
        password: 'admin123',
        role: 'admin',
        status: 'active'
      },
      {
        name: 'Ramesh Kumar',
        email: 'ramesh@dhobi.com',
        password: 'dhobi123',
        phone: '9876543210',
        role: 'dhobi',
        status: 'active',
        dhobiProfile: {
          service_area: 'Mumbai',
          experience_years: 5,
          rating: 4.5,
          total_orders: 0,
          is_verified: true,
          availability_status: 'available'
        }
      },
      {
        name: 'John Doe',
        email: 'user@dhobi.com',
        password: 'user123',
        phone: '9123456789',
        role: 'user',
        status: 'active'
      }
    ];

    for (const userData of seedUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(`⏭  Skipping ${userData.email} (already exists)`);
        continue;
      }

      const hashed = await bcrypt.hash(userData.password, 10);
      await User.create({ ...userData, password: hashed });
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🎉 Seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
