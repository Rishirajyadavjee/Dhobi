import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Auth & Validation Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // 1. Test registration with an existing phone number
  try {
    console.log('--- Test 1: Duplicate Phone Number Registration ---');
    await axios.post(`${API_URL}/auth/register`, {
      name: 'Duplicate Phone User',
      email: `unique-${Date.now()}@test.com`,
      password: 'password123',
      phone: '9876543210', // Ramesh's existing phone!
      role: 'user'
    });
    assert(false, 'Duplicate phone should be rejected');
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message;
    assert(status === 400, 'Duplicate phone returns 400', `Status: ${status}, Msg: "${msg}"`);
    assert(msg && (msg.includes('already registered') || msg.includes('phone number')), 'Error message mentions phone registration', msg);
  }

  // 2. Test registration with phone starting with 0
  try {
    console.log('\n--- Test 2: Phone Number Starting with 0 ---');
    await axios.post(`${API_URL}/auth/register`, {
      name: 'Zero Phone User',
      email: `zero-${Date.now()}@test.com`,
      password: 'password123',
      phone: '0987654321',
      role: 'user'
    });
    assert(false, 'Phone starting with 0 should be rejected');
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message;
    assert(status === 400, 'Phone starting with 0 returns 400', `Status: ${status}, Msg: "${msg}"`);
  }

  // 3. Test registration with phone length not 10 digits
  try {
    console.log('\n--- Test 3: Phone Number with invalid length (8 digits) ---');
    await axios.post(`${API_URL}/auth/register`, {
      name: 'Short Phone User',
      email: `short-${Date.now()}@test.com`,
      password: 'password123',
      phone: '98765432',
      role: 'user'
    });
    assert(false, 'Short phone should be rejected');
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message;
    assert(status === 400, 'Short phone returns 400', `Status: ${status}, Msg: "${msg}"`);
  }

  // 4. Test registration with duplicate email
  try {
    console.log('\n--- Test 4: Duplicate Email Registration ---');
    await axios.post(`${API_URL}/auth/register`, {
      name: 'Duplicate Email User',
      email: 'admin@dhobi.com',
      password: 'password123',
      phone: '9988776655',
      role: 'user'
    });
    assert(false, 'Duplicate email should be rejected');
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message;
    assert(status === 400, 'Duplicate email returns 400', `Status: ${status}, Msg: "${msg}"`);
    assert(msg && msg.includes('email'), 'Error message mentions email', msg);
  }

  // 5. Test valid registration with new unique email and phone
  const testPhone = `91${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testEmail = `newuser-${Date.now()}@example.com`;
  let registeredToken = '';

  try {
    console.log('\n--- Test 5: Valid Registration with New Credentials ---');
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Valid New Customer',
      email: testEmail,
      password: 'mypassword123',
      phone: testPhone,
      role: 'user'
    });
    assert(res.status === 201, 'Valid registration returns 201', `Status: ${res.status}`);
    assert(res.data.success === true, 'Success flag is true');
    assert(res.data.user?.phone === testPhone, 'Phone number saved correctly', res.data.user?.phone);
    registeredToken = res.data.token;
  } catch (err) {
    assert(false, 'Valid registration failed', err.response?.data?.message || err.message);
  }

  // 6. Test re-entering that EXACT phone number again in database
  try {
    console.log('\n--- Test 6: Re-entering the newly registered phone number ---');
    await axios.post(`${API_URL}/auth/register`, {
      name: 'Another User Same Phone',
      email: `another-${Date.now()}@example.com`,
      password: 'password123',
      phone: testPhone, // EXACT SAME PHONE AS TEST 5!
      role: 'user'
    });
    assert(false, 'Re-entered phone number must NOT be saved');
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message;
    assert(status === 400, 'Re-entered phone is blocked with 400', `Status: ${status}, Msg: "${msg}"`);
  }

  // 7. Test login with Email
  try {
    console.log('\n--- Test 7: Login using Email ---');
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: 'mypassword123'
    });
    assert(res.status === 200, 'Login with email returns 200');
    assert(res.data.token !== undefined, 'Returns auth token');
  } catch (err) {
    assert(false, 'Login with email failed', err.response?.data?.message || err.message);
  }

  // 8. Test login with Phone Number!
  try {
    console.log('\n--- Test 8: Login using Phone Number ---');
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: testPhone, // Entered phone number in the identifier field!
      password: 'mypassword123'
    });
    assert(res.status === 200, 'Login with phone number returns 200');
    assert(res.data.user?.phone === testPhone, 'Logged-in user matches phone');
  } catch (err) {
    assert(false, 'Login with phone number failed', err.response?.data?.message || err.message);
  }

  // 9. Test login with invalid password
  try {
    console.log('\n--- Test 9: Login with incorrect password ---');
    await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: 'wrongpassword'
    });
    assert(false, 'Incorrect password should fail');
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message;
    assert(status === 401, 'Incorrect password returns 401', `Status: ${status}, Msg: "${msg}"`);
  }

  console.log(`\n==========================================`);
  console.log(`Test Summary: Passed: ${passed}, Failed: ${failed}`);
  console.log(`==========================================\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
