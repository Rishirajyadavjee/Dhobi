import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function test() {
  console.log('🧪 Testing API Endpoints\n');

  try {
    // Test with actual users from DB
    console.log('1️⃣ Testing Login with dhobiuser@gmail.com...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'dhobiuser@gmail.com',
      password: 'password' // This might not work, let's try generic ones
    });
    
    console.log('❌ Login failed - trying other passwords...');
  } catch (err) {
    console.log('❌ That didn\'t work');
  }

  // Try with admin
  try {
    console.log('\n2️⃣ Testing Login with admin@dhobi.com...');
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@dhobi.com',
      password: 'admin123'
    });
    
    console.log('✅ Admin login successful!');
    const adminToken = adminRes.data.token;

    // Test Admin Stats
    console.log('\n3️⃣ Fetching Admin Stats...');
    const statsRes = await axios.get(`${BASE_URL}/orders/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Stats Retrieved:', statsRes.data.data);

    // Test Get All Orders
    console.log('\n4️⃣ Fetching All Orders...');
    const ordersRes = await axios.get(`${BASE_URL}/orders/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Orders Retrieved:', ordersRes.data.data?.length || 0, 'orders');

  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }

  process.exit(0);
}

test();
