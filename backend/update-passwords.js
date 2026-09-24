import db from './config/database.js';

async function updatePasswords() {
  try {
    console.log('🔐 Updating passwords...\n');

    // Hashes generated from: admin123, user123, dhobi123
    const updates = [
      {
        email: 'admin@dhobi.com',
        hash: '$2a$10$S9eslw7Z8dB7ZA3qQSS9k.7/6O1MO5fprRmtUAE7/VFly2agqPSP2',
        password: 'admin123'
      },
      {
        email: 'ramesh@dhobi.com',
        hash: '$2a$10$DBqgcX/WIonbL4iOzw5TqOywtH1HedBenCSoDhT3aM5PZiNrOzA0e',
        password: 'dhobi123'
      },
      {
        email: 'user@dhobi.com',
        hash: '$2a$10$xo5Zz1qOW9B53nTwBsLYiOKXZMitsMtAWHJLb88oqE8a4BFAOuAr6',
        password: 'user123'
      },
      {
        email: 'dhobiuser@gmail.com',
        hash: '$2a$10$xo5Zz1qOW9B53nTwBsLYiOKXZMitsMtAWHJLb88oqE8a4BFAOuAr6',
        password: 'user123' // Use same as user@dhobi.com
      }
    ];

    for (const user of updates) {
      await db.query('UPDATE users SET password = ? WHERE email = ?', [user.hash, user.email]);
      console.log(`✅ Updated ${user.email} with password: ${user.password}`);
    }

    console.log('\n✅ All passwords updated!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePasswords();
