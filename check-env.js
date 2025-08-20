require('dotenv').config();

console.log("🔍 Environment Variables Check");
console.log("==============================");

// Required environment variables
const requiredVars = {
  // Database
  'DB_HOST': process.env.DB_HOST,
  'DB_PORT': process.env.DB_PORT,
  'DB_NAME': process.env.DB_NAME,
  'DB_USER': process.env.DB_USER,
  'DB_PASSWORD': process.env.DB_PASSWORD,
  
  // JWT
  'JWT_SECRET': process.env.JWT_SECRET,
  'JWT_EXPIRES_IN': process.env.JWT_EXPIRES_IN,
  
  // OpenAI
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
  
  // Server
  'PORT': process.env.PORT,
  'NODE_ENV': process.env.NODE_ENV,
  
  // Rate Limiting
  'RATE_LIMIT_WINDOW_MS': process.env.RATE_LIMIT_WINDOW_MS,
  'RATE_LIMIT_MAX_REQUESTS': process.env.RATE_LIMIT_MAX_REQUESTS,
  
  // Frontend (optional for development)
  'REACT_APP_API_URL': process.env.REACT_APP_API_URL,
};

// Check each variable
let allGood = true;
console.log("\n📋 Variable Status:");
console.log("===================");

Object.entries(requiredVars).forEach(([key, value]) => {
  const status = value ? "✅" : "❌";
  const displayValue = key.includes('PASSWORD') || key.includes('SECRET') || key.includes('API_KEY') 
    ? (value ? "✅ Loaded" : "❌ Missing") 
    : value || "❌ Missing";
  
  console.log(`${status} ${key}: ${displayValue}`);
  
  if (!value) {
    allGood = false;
  }
});

// Additional checks
console.log("\n🔧 Configuration Checks:");
console.log("========================");

// Database connection test
const { Pool } = require('pg');
try {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.log("❌ Database connection: Failed");
      console.log("   Error:", err.message);
    } else {
      console.log("✅ Database connection: Success");
    }
    pool.end();
  });
} catch (error) {
  console.log("❌ Database connection: Failed to create pool");
  console.log("   Error:", error.message);
}

// OpenAI API test
if (process.env.OPENAI_API_KEY) {
  console.log("✅ OpenAI API Key: Present");
} else {
  console.log("❌ OpenAI API Key: Missing");
}

// JWT Secret check
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
  console.log("✅ JWT Secret: Valid (32+ characters)");
} else if (process.env.JWT_SECRET) {
  console.log("⚠️  JWT Secret: Present but weak (should be 32+ characters)");
} else {
  console.log("❌ JWT Secret: Missing");
}

// Environment summary
console.log("\n📊 Summary:");
console.log("============");
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${process.env.PORT || 5000}`);
console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

if (allGood) {
  console.log("\n🎉 All required environment variables are set!");
} else {
  console.log("\n⚠️  Some environment variables are missing. Please check your .env file.");
  console.log("\n📝 Required variables:");
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      console.log(`   - ${key}`);
    }
  });
}
