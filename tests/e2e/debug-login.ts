/**
 * Script para debuggear el login
 */

async function testLogin() {
  console.log("Testing login API...");

  try {
    const response = await fetch("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000",
      },
      body: JSON.stringify({
        email: "test@medround.com",
        password: "TestPass123!",
        rememberMe: true,
      }),
    });

    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    const body = await response.text();
    console.log("Body:", body);

    if (!response.ok) {
      console.error("❌ Login failed");
    } else {
      console.log("✅ Login successful");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testLogin();
