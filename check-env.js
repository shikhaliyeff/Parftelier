require('dotenv').config();

console.log("ENV check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Not Loaded");
