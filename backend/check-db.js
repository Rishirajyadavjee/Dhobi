import db from './config/database.js';

async function check() {
  try {
    const [users] = await db.query('SELECT id, name, email, role, status FROM users');
    console.log('📊 Users in database:');
    console.log(users);
    
    const [orders] = await db.query('SELECT id, order_number, status FROM orders LIMIT 5');
    console.log('\n📊 Orders in database:');
    console.log(orders);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

check();
