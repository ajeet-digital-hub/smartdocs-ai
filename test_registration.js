const DUMMY_USER = {
  fullName: "Test User",
  email: `test-${Date.now()}@example.com`,
  password: "Password123!",
};

async function testRegistration() {
  let otp;

  // Step 1: Request OTP
  console.log(`Requesting OTP for ${DUMMY_USER.email}...`);
  try {
    const otpResponse = await fetch("http://localhost:3000/api/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purpose: "signup",
        ...DUMMY_USER,
      }),
    });

    const otpData = await otpResponse.json();
    if (!otpResponse.ok || !otpData.ok) {
      console.error("Failed to request OTP:", otpData);
      return;
    }

    if (otpData.dev && otpData.dev.code) {
      otp = otpData.dev.code;
      console.log(`OTP received: ${otp}`);
    } else {
      console.error("OTP not found in response. Make sure NODE_ENV is 'development'.");
      return;
    }
  } catch (error) {
    console.error("Error requesting OTP:", error);
    return;
  }

  // Step 2: Verify OTP and create user
  console.log("Verifying OTP and creating user...");
  try {
    const verifyResponse = await fetch("http://localhost:3000/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: DUMMY_USER.email,
        code: otp,
      }),
    });

    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok || !verifyData.ok) {
      console.error("Failed to verify OTP:", verifyData);
      return;
    }

    console.log("Registration successful:", verifyData);
  } catch (error) {
    console.error("Error verifying OTP:", error);
  }
}

testRegistration();
