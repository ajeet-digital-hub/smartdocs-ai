const fetch = require('node-fetch');

async function testSignup() {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      signupMethod: 'email',
      fullName: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'Password123!',
    }),
  });

  const data = await response.json();
  console.log(data);
}

testSignup();
