#!/usr/bin/env node

/**
 * CORS Testing Script
 * Tests CORS configuration for the manga website API
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_ORIGIN = process.env.TEST_ORIGIN || 'https://example.com';

// Test endpoints
const ENDPOINTS = [
  '/api/manga',
  '/api/search?q=test',
  '/api/genres',
  '/api/health',
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function testPreflight(endpoint) {
  log(`\n🔍 Testing preflight for ${endpoint}`, 'blue');
  
  try {
    const response = await makeRequest(`${BASE_URL}${endpoint}`, {
      method: 'OPTIONS',
      headers: {
        'Origin': TEST_ORIGIN,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
      'access-control-max-age': response.headers['access-control-max-age']
    };
    
    log(`Status: ${response.statusCode}`, response.statusCode === 200 ? 'green' : 'red');
    log('CORS Headers:');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) {
        log(`  ${key}: ${value}`, 'yellow');
      }
    });
    
    // Check if CORS is properly configured
    const hasOrigin = corsHeaders['access-control-allow-origin'];
    const hasMethods = corsHeaders['access-control-allow-methods'];
    const hasHeaders = corsHeaders['access-control-allow-headers'];
    
    if (hasOrigin && hasMethods && hasHeaders) {
      log('✅ Preflight CORS: PASS', 'green');
    } else {
      log('❌ Preflight CORS: FAIL', 'red');
    }
    
    return response.statusCode === 200;
  } catch (error) {
    log(`❌ Preflight Error: ${error.message}`, 'red');
    return false;
  }
}

async function testActualRequest(endpoint) {
  log(`\n🚀 Testing actual request for ${endpoint}`, 'blue');
  
  try {
    const response = await makeRequest(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Origin': TEST_ORIGIN,
        'Content-Type': 'application/json'
      }
    });
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
      'access-control-expose-headers': response.headers['access-control-expose-headers']
    };
    
    log(`Status: ${response.statusCode}`, response.statusCode < 400 ? 'green' : 'red');
    log('CORS Headers:');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) {
        log(`  ${key}: ${value}`, 'yellow');
      }
    });
    
    // Check if response has CORS headers
    const hasOrigin = corsHeaders['access-control-allow-origin'];
    
    if (hasOrigin) {
      log('✅ Actual Request CORS: PASS', 'green');
    } else {
      log('❌ Actual Request CORS: FAIL', 'red');
    }
    
    return response.statusCode < 400;
  } catch (error) {
    log(`❌ Request Error: ${error.message}`, 'red');
    return false;
  }
}

async function testCorsConfiguration() {
  log(`${colors.bold}🧪 CORS Testing Suite${colors.reset}`, 'blue');
  log(`Base URL: ${BASE_URL}`);
  log(`Test Origin: ${TEST_ORIGIN}`);
  log('='.repeat(50));
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const endpoint of ENDPOINTS) {
    log(`\n${'='.repeat(30)}`, 'blue');
    log(`Testing endpoint: ${endpoint}`, 'bold');
    log(`${'='.repeat(30)}`, 'blue');
    
    // Test preflight
    totalTests++;
    const preflightPassed = await testPreflight(endpoint);
    if (preflightPassed) passedTests++;
    
    // Test actual request
    totalTests++;
    const requestPassed = await testActualRequest(endpoint);
    if (requestPassed) passedTests++;
  }
  
  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log(`${colors.bold}📊 Test Summary${colors.reset}`, 'blue');
  log('='.repeat(50), 'blue');
  log(`Total Tests: ${totalTests}`);
  log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`Failed: ${totalTests - passedTests}`, totalTests - passedTests === 0 ? 'green' : 'red');
  log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`, 
      passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('\n🎉 All CORS tests passed!', 'green');
  } else {
    log('\n⚠️  Some CORS tests failed. Check configuration.', 'yellow');
  }
}

// Run tests
if (require.main === module) {
  testCorsConfiguration().catch(error => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testCorsConfiguration,
  testPreflight,
  testActualRequest
};
