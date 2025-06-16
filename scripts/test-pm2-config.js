#!/usr/bin/env node

/**
 * PM2 Configuration Test Script
 *
 * This script validates the PM2 ecosystem configuration
 * and checks if all required dependencies are available.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing PM2 Configuration...\n');

// Test 1: Check if ecosystem.config.js exists
console.log('1. Checking ecosystem.config.js...');
const ecosystemPath = path.join(process.cwd(), 'ecosystem.config.js');
if (fs.existsSync(ecosystemPath)) {
  console.log('   ✅ ecosystem.config.js found');

  try {
    const config = require(ecosystemPath);
    console.log('   ✅ Configuration file is valid JavaScript');

    if (config.apps && config.apps.length > 0) {
      console.log('   ✅ Apps configuration found');
      const app = config.apps[0];
      console.log(`   📱 App name: ${app.name}`);
      console.log(`   🚀 Script: ${app.script}`);
      console.log(
        `   🌍 Environment: ${app.env_production ? 'Production ready' : 'Development only'}`
      );
    } else {
      console.log('   ❌ No apps configuration found');
    }
  } catch (error) {
    console.log('   ❌ Configuration file has syntax errors:', error.message);
  }
} else {
  console.log('   ❌ ecosystem.config.js not found');
}

// Test 2: Check logs directory
console.log('\n2. Checking logs directory...');
const logsDir = path.join(process.cwd(), 'logs', 'pm2');
if (fs.existsSync(logsDir)) {
  console.log('   ✅ PM2 logs directory exists');
} else {
  console.log('   ❌ PM2 logs directory not found');
  console.log('   💡 Run: mkdir -p logs/pm2');
}

// Test 3: Check if PM2 is available
console.log('\n3. Checking PM2 availability...');
const { execSync } = require('child_process');
try {
  const pm2Version = execSync('pm2 --version', { encoding: 'utf8' }).trim();
  console.log(`   ✅ PM2 is installed (version: ${pm2Version})`);
} catch (error) {
  console.log('   ❌ PM2 is not installed globally');
  console.log('   💡 Run: npm install -g pm2');
}

// Test 4: Check package.json scripts
console.log('\n4. Checking package.json PM2 scripts...');
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const pm2Scripts = Object.keys(packageJson.scripts || {}).filter(script =>
    script.startsWith('pm2:')
  );

  if (pm2Scripts.length > 0) {
    console.log('   ✅ PM2 scripts found:');
    pm2Scripts.forEach(script => {
      console.log(`      - ${script}: ${packageJson.scripts[script]}`);
    });
  } else {
    console.log('   ❌ No PM2 scripts found in package.json');
  }
}

// Test 5: Check environment file
console.log('\n5. Checking environment configuration...');
const envProdPath = path.join(process.cwd(), '.env.production');
if (fs.existsSync(envProdPath)) {
  console.log('   ✅ .env.production file exists');
} else {
  console.log('   ⚠️  .env.production file not found');
  console.log('   💡 Copy from .env.production.example and configure');
}

console.log('\n🎉 PM2 Configuration Test Complete!');
console.log('\n📚 Next steps:');
console.log('   1. Install PM2 globally: npm install -g pm2');
console.log('   2. Configure .env.production file');
console.log('   3. Test locally: pnpm pm2:start');
console.log('   4. Check status: pnpm pm2:status');
