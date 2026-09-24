import bcrypt from 'bcryptjs';

async function generateHashes() {
  console.log('🔐 Generating password hashes...\n');

  const passwords = [
    { email: 'admin@dhobi.com', password: 'admin123', role: 'admin' },
    { email: 'ramesh@dhobi.com', password: 'dhobi123', role: 'dhobi' },
    { email: 'user@dhobi.com', password: 'user123', role: 'user' }
  ];

  for (const user of passwords) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`${user.email} (${user.role}):`);
    console.log(`  Plain: ${user.password}`);
    console.log(`  Hash:  ${hash}\n`);
  }
}

generateHashes();
