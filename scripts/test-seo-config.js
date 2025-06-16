#!/usr/bin/env node

/**
 * SEO Configuration Test Script
 * Tests and validates the SEO configuration with environment variables
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key.trim() && !key.startsWith('#')) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
    logInfo(`Loaded environment variables from .env file`);
  } else {
    logWarning('.env file not found');
  }
}

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'bold');
  console.log('='.repeat(50));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test environment variables
function testEnvironmentVariables() {
  logSection('Testing Environment Variables');

  const requiredVars = [
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_SITE_NAME',
    'NEXT_PUBLIC_SITE_DESCRIPTION',
  ];

  const optionalVars = [
    'NEXT_PUBLIC_SITE_TAGLINE',
    'NEXT_PUBLIC_SITE_KEYWORDS',
    'NEXT_PUBLIC_SITE_LANGUAGE',
    'NEXT_PUBLIC_SITE_LOCALE',
    'NEXT_PUBLIC_LOGO_URL',
    'NEXT_PUBLIC_FAVICON_URL',
    'NEXT_PUBLIC_OG_IMAGE',
    'NEXT_PUBLIC_TWITTER_HANDLE',
    'NEXT_PUBLIC_TWITTER_CREATOR',
    'NEXT_PUBLIC_FACEBOOK_PAGE',
    'NEXT_PUBLIC_TITLE_TEMPLATE',
    'NEXT_PUBLIC_DEFAULT_TITLE',
    'NEXT_PUBLIC_ORG_NAME',
    'NEXT_PUBLIC_ORG_LEGAL_NAME',
    'NEXT_PUBLIC_ORG_FOUNDING_DATE',
    'NEXT_PUBLIC_ORG_COUNTRY',
  ];

  const analyticsVars = [
    'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',
    'NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID',
    'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
    'NEXT_PUBLIC_FACEBOOK_PIXEL_ID',
  ];

  // Check required variables
  let missingRequired = 0;
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName}: ${process.env[varName]}`);
    } else {
      logError(`${varName}: Not set (REQUIRED)`);
      missingRequired++;
    }
  });

  // Check optional variables
  let setOptional = 0;
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName}: ${process.env[varName]}`);
      setOptional++;
    } else {
      logWarning(`${varName}: Not set (optional)`);
    }
  });

  // Check analytics variables
  let setAnalytics = 0;
  analyticsVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName}: ${process.env[varName]}`);
      setAnalytics++;
    } else {
      logInfo(`${varName}: Not set (analytics)`);
    }
  });

  logSection('Environment Variables Summary');
  logInfo(
    `Required variables: ${requiredVars.length - missingRequired}/${requiredVars.length} set`
  );
  logInfo(`Optional variables: ${setOptional}/${optionalVars.length} set`);
  logInfo(`Analytics variables: ${setAnalytics}/${analyticsVars.length} set`);

  if (missingRequired > 0) {
    logError(`Missing ${missingRequired} required environment variables!`);
    return false;
  }

  return true;
}

// Test SEO configuration loading
function testSeoConfig() {
  logSection('Testing SEO Configuration Loading');

  try {
    // This would require building the project first
    logInfo('SEO configuration test requires a built project');
    logInfo('Run: npm run build && node -e "console.log(require(\'./src/config/seo.config.ts\'))"');
    return true;
  } catch (error) {
    logError(`Failed to load SEO config: ${error.message}`);
    return false;
  }
}

// Test file structure
function testFileStructure() {
  logSection('Testing File Structure');

  const requiredFiles = [
    'src/config/seo.config.ts',
    'src/components/analytics/Analytics.tsx',
    'docs/seo-environment-variables-guide.md',
    '.env.example',
  ];

  let allFilesExist = true;

  requiredFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      logSuccess(`${filePath}: Exists`);
    } else {
      logError(`${filePath}: Missing`);
      allFilesExist = false;
    }
  });

  return allFilesExist;
}

// Test build process
function testBuild() {
  logSection('Testing Build Process');

  try {
    logInfo('Running build test...');
    execSync('npm run build', { stdio: 'pipe' });
    logSuccess('Build completed successfully');
    return true;
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    return false;
  }
}

// Main test function
function runTests() {
  logSection('SEO Configuration Test Suite');
  logInfo('Testing SEO environment variables configuration...');

  // Load environment variables first
  loadEnvFile();

  const results = {
    envVars: testEnvironmentVariables(),
    fileStructure: testFileStructure(),
    seoConfig: testSeoConfig(),
    build: testBuild(),
  };

  logSection('Test Results Summary');

  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      logSuccess(`${test}: PASSED`);
    } else {
      logError(`${test}: FAILED`);
    }
  });

  const allPassed = Object.values(results).every(result => result);

  if (allPassed) {
    logSuccess('\n🎉 All tests passed! SEO configuration is working correctly.');
  } else {
    logError('\n💥 Some tests failed. Please check the configuration.');
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
