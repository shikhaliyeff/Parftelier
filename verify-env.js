#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

console.log("🔍 ScentSage Environment Verification");
console.log("=====================================");

// Test configuration
const config = {
  backend: {
    url: `http://localhost:${process.env.PORT || 5000}`,
    health: '/health'
  },
  frontend: {
    url: 'http://localhost:3000',
    proxy: '/api/profile/onboarding-questions'
  },
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER
  }
};

async function testBackend() {
  console.log("\n🔧 Backend Tests:");
  console.log("=================");
  
  try {
    const response = await axios.get(`${config.backend.url}${config.backend.health}`);
    console.log("✅ Backend Health Check: PASSED");
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Environment: ${response.data.environment}`);
  } catch (error) {
    console.log("❌ Backend Health Check: FAILED");
    console.log(`   Error: ${error.message}`);
    return false;
  }
  
  return true;
}

async function testFrontend() {
  console.log("\n🌐 Frontend Tests:");
  console.log("==================");
  
  try {
    const response = await axios.get(config.frontend.url);
    if (response.data.includes('ScentSage')) {
      console.log("✅ Frontend Loading: PASSED");
    } else {
      console.log("⚠️  Frontend Loading: PARTIAL (React app loaded but may not be ScentSage)");
    }
  } catch (error) {
    console.log("❌ Frontend Loading: FAILED");
    console.log(`   Error: ${error.message}`);
    return false;
  }
  
  return true;
}

async function testProxy() {
  console.log("\n🔄 API Proxy Tests:");
  console.log("===================");
  
  try {
    const response = await axios.get(`${config.frontend.url}${config.frontend.proxy}`);
    if (response.data && response.data.questions) {
      console.log("✅ API Proxy: PASSED");
      console.log("   Frontend can reach backend through proxy");
    } else {
      console.log("⚠️  API Proxy: PARTIAL (proxy works but unexpected response format)");
    }
  } catch (error) {
    console.log("❌ API Proxy: FAILED");
    console.log(`   Error: ${error.message}`);
    return false;
  }
  
  return true;
}

async function testDatabase() {
  console.log("\n🗄️  Database Tests:");
  console.log("===================");
  
  const { Pool } = require('pg');
  
  try {
    const pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: process.env.DB_PASSWORD || undefined,
    });
    
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log("✅ Database Connection: PASSED");
    console.log(`   Users in database: ${result.rows[0].count}`);
    
    // Test perfumes table
    const perfumesResult = await pool.query('SELECT COUNT(*) as count FROM perfumes');
    console.log(`   Perfumes in database: ${perfumesResult.rows[0].count}`);
    
    await pool.end();
    return true;
  } catch (error) {
    console.log("❌ Database Connection: FAILED");
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log("\n🔐 Environment Variables:");
  console.log("=========================");
  
  const required = {
    'NODE_ENV': process.env.NODE_ENV,
    'PORT': process.env.PORT,
    'DB_HOST': process.env.DB_HOST,
    'DB_PORT': process.env.DB_PORT,
    'DB_NAME': process.env.DB_NAME,
    'DB_USER': process.env.DB_USER,
    'JWT_SECRET': process.env.JWT_SECRET,
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
  };
  
  const optional = {
    'DB_PASSWORD': process.env.DB_PASSWORD,
    'JWT_EXPIRES_IN': process.env.JWT_EXPIRES_IN,
    'RATE_LIMIT_WINDOW_MS': process.env.RATE_LIMIT_WINDOW_MS,
    'RATE_LIMIT_MAX_REQUESTS': process.env.RATE_LIMIT_MAX_REQUESTS,
  };
  
  let allRequired = true;
  
  console.log("Required Variables:");
  Object.entries(required).forEach(([key, value]) => {
    const status = value ? "✅" : "❌";
    const displayValue = key.includes('SECRET') || key.includes('API_KEY') 
      ? (value ? "✅ Set" : "❌ Missing") 
      : value || "❌ Missing";
    
    console.log(`   ${status} ${key}: ${displayValue}`);
    if (!value) allRequired = false;
  });
  
  console.log("\nOptional Variables:");
  Object.entries(optional).forEach(([key, value]) => {
    const status = value ? "✅" : "⚠️";
    console.log(`   ${status} ${key}: ${value || "Not set (using defaults)"}`);
  });
  
  return allRequired;
}

async function runAllTests() {
  console.log("Starting comprehensive environment verification...\n");
  
  const results = {
    env: await testEnvironmentVariables(),
    db: await testDatabase(),
    backend: await testBackend(),
    frontend: await testFrontend(),
    proxy: await testProxy(),
  };
  
  console.log("\n📊 Test Summary:");
  console.log("================");
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${test.toUpperCase()}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log("\n🎉 All tests passed! Your environment is properly configured.");
    console.log("\n🚀 You can now:");
    console.log("   - Start the backend: npm run server");
    console.log("   - Start the frontend: npm run client");
    console.log("   - Access the app at: http://localhost:3000");
  } else {
    console.log("\n⚠️  Some tests failed. Please check the configuration above.");
    console.log("\n🔧 Common fixes:");
    console.log("   - Ensure PostgreSQL is running");
    console.log("   - Check that all required environment variables are set");
    console.log("   - Verify that ports 3000 and 5000 are available");
  }
  
  return allPassed;
}

// Run the verification
runAllTests().catch(console.error);
