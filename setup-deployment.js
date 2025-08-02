#!/usr/bin/env node

/**
 * Study Planner Deployment Setup Script
 * This script helps set up the dual database configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Study Planner Deployment Setup');
console.log('================================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('\n📝 Creating .env file for development...');
  fs.writeFileSync(envPath, 'DATABASE_URL="file:./dev.db"\n');
  console.log('✅ Created .env file with SQLite configuration');
} else {
  console.log('✅ .env file already exists');
}

// Check if .env.production exists
const envProdPath = path.join(__dirname, '.env.production');
const envProdExists = fs.existsSync(envProdPath);

if (!envProdExists) {
  console.log('\n📝 Creating .env.production template...');
  const prodTemplate = `# Production environment - PostgreSQL (Supabase)
# Replace with your Supabase connection string
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
`;
  fs.writeFileSync(envProdPath, prodTemplate);
  console.log('✅ Created .env.production template');
} else {
  console.log('✅ .env.production already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Create Supabase project at https://supabase.com');
console.log('2. Get your database connection string from Supabase dashboard');
console.log('3. Update .env.production with your Supabase URL');
console.log('4. Run: npm run deploy:prepare');
console.log('5. Deploy to Vercel: https://vercel.com');
console.log('\n📖 See DEPLOYMENT.md for detailed instructions');

console.log('\n🎯 Current Configuration:');
console.log('- Development: SQLite (file:./dev.db)');
console.log('- Production: PostgreSQL (Supabase)');
console.log('- Schema: Updated with abbreviation and status fields');

console.log('\n✨ Setup complete! Ready for deployment.'); 