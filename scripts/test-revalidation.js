#!/usr/bin/env node

/**
 * Test Script for On-demand Revalidation API
 * 
 * This script tests the revalidation API endpoint to ensure it's working correctly.
 * Run with: node scripts/test-revalidation.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const SECRET = process.env.REVALIDATION_SECRET;

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  const result = await makeRequest('/api/revalidate');
  
  if (result.status === 200) {
    console.log('✅ Health check passed');
    console.log('📋 API Info:', result.data.message);
    return true;
  } else {
    console.log('❌ Health check failed:', result);
    return false;
  }
}

async function testBasicRevalidation() {
  console.log('\n🔄 Testing basic revalidation...');
  const result = await makeRequest('/api/revalidate', {
    method: 'POST',
    body: JSON.stringify({
      tags: ['manga-list', 'test-tag'],
      paths: ['/manga', '/test'],
      secret: SECRET,
    }),
  });

  if (result.status === 200 && result.data.success) {
    console.log('✅ Basic revalidation successful');
    console.log('📊 Revalidated:', result.data.revalidated);
    return true;
  } else {
    console.log('❌ Basic revalidation failed:', result);
    return false;
  }
}

async function testMangaRevalidation() {
  console.log('\n📚 Testing manga-specific revalidation...');
  const result = await makeRequest('/api/revalidate', {
    method: 'POST',
    body: JSON.stringify({
      mangaSlug: 'test-manga',
      secret: SECRET,
    }),
  });

  if (result.status === 200 && result.data.success) {
    console.log('✅ Manga revalidation successful');
    console.log('📊 Revalidated:', result.data.revalidated);
    return true;
  } else {
    console.log('❌ Manga revalidation failed:', result);
    return false;
  }
}

async function testChapterRevalidation() {
  console.log('\n📖 Testing chapter-specific revalidation...');
  const result = await makeRequest('/api/revalidate', {
    method: 'POST',
    body: JSON.stringify({
      mangaSlug: 'test-manga',
      chapterId: 'test-chapter-123',
      secret: SECRET,
    }),
  });

  if (result.status === 200 && result.data.success) {
    console.log('✅ Chapter revalidation successful');
    console.log('📊 Revalidated:', result.data.revalidated);
    return true;
  } else {
    console.log('❌ Chapter revalidation failed:', result);
    return false;
  }
}

async function testGenreRevalidation() {
  console.log('\n🏷️ Testing genre-specific revalidation...');
  const result = await makeRequest('/api/revalidate', {
    method: 'POST',
    body: JSON.stringify({
      genreSlug: 'action',
      secret: SECRET,
    }),
  });

  if (result.status === 200 && result.data.success) {
    console.log('✅ Genre revalidation successful');
    console.log('📊 Revalidated:', result.data.revalidated);
    return true;
  } else {
    console.log('❌ Genre revalidation failed:', result);
    return false;
  }
}

async function testSecurityWithoutSecret() {
  console.log('\n🔒 Testing security without secret...');
  const result = await makeRequest('/api/revalidate', {
    method: 'POST',
    body: JSON.stringify({
      tags: ['test-tag'],
    }),
  });

  if (SECRET && result.status === 401) {
    console.log('✅ Security test passed - unauthorized without secret');
    return true;
  } else if (!SECRET && result.status === 200) {
    console.log('✅ Security test passed - no secret required');
    return true;
  } else {
    console.log('❌ Security test failed:', result);
    return false;
  }
}

async function testInvalidRequest() {
  console.log('\n❌ Testing invalid request handling...');
  const result = await makeRequest('/api/revalidate', {
    method: 'POST',
    body: 'invalid json',
  });

  if (result.status === 500 || result.error) {
    console.log('✅ Invalid request handled correctly');
    return true;
  } else {
    console.log('❌ Invalid request not handled properly:', result);
    return false;
  }
}

async function testCORSOptions() {
  console.log('\n🌐 Testing CORS OPTIONS request...');
  const result = await makeRequest('/api/revalidate', {
    method: 'OPTIONS',
  });

  if (result.status === 200) {
    console.log('✅ CORS OPTIONS request successful');
    return true;
  } else {
    console.log('❌ CORS OPTIONS request failed:', result);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Revalidation API Tests');
  console.log('🔗 API URL:', API_URL);
  console.log('🔑 Secret configured:', SECRET ? 'Yes' : 'No');
  console.log('=' .repeat(50));

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Basic Revalidation', fn: testBasicRevalidation },
    { name: 'Manga Revalidation', fn: testMangaRevalidation },
    { name: 'Chapter Revalidation', fn: testChapterRevalidation },
    { name: 'Genre Revalidation', fn: testGenreRevalidation },
    { name: 'Security Test', fn: testSecurityWithoutSecret },
    { name: 'Invalid Request', fn: testInvalidRequest },
    { name: 'CORS Options', fn: testCORSOptions },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} threw error:`, error.message);
      failed++;
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Revalidation API is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Please check the configuration and try again.');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testBasicRevalidation,
  testMangaRevalidation,
};
