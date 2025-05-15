// This is a test script to verify connection to the backend API
// Run with: node api-connection-test.js

const axios = require('axios');

const API_URL = process.env.API_URL || 'https://shadowshield-backend.onrender.com';

console.log(`Testing connection to: ${API_URL}`);

// Test basic connection
axios.get(`${API_URL}/health`)
  .then(response => {
    console.log('✅ Connection successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  })
  .catch(error => {
    console.error('❌ Connection failed:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
  });

// Test login endpoint
setTimeout(() => {
  console.log('\nTesting login endpoint...');
  axios.post(`${API_URL}/api/auth/login`, {
    email: 'test@example.com', // Use a test account email
    password: 'password123'    // Use a test account password
  })
    .then(response => {
      console.log('✅ Login endpoint is working!');
    })
    .catch(error => {
      if (error.response && error.response.status === 401) {
        console.log('✅ Login endpoint is reachable (returned 401 Unauthorized, which is expected for invalid credentials)');
      } else {
        console.error('❌ Login endpoint test failed:');
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        } else {
          console.error('Error message:', error.message);
        }
      }
    });
}, 1000);

// Test register endpoint
setTimeout(() => {
  console.log('\nTesting register endpoint...');
  const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
  
  axios.post(`${API_URL}/api/auth/register`, {
    name: 'Test User',
    email: randomEmail,
    password: 'password123'
  })
    .then(response => {
      console.log('✅ Register endpoint is working!');
    })
    .catch(error => {
      console.error('❌ Register endpoint test failed:');
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else {
        console.error('Error message:', error.message);
      }
    });
}, 2000);
