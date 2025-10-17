/**
 * Test Suite for GitHub API Client
 * Run this to validate the client works before building tools
 * 
 * Usage: tsx src/mastra/tools/github/core/test-client.ts
 */

import { fetchGitHub, getRateLimit, fetchWithRetry, GitHubAPIError } from './client';
import { requireAuth, getOptionalToken, isValidTokenFormat, maskToken } from './auth';

async function runTests() {
  console.log('🧪 GitHub API Client Test Suite\n');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;

  // Test 1: Public API access (no auth)
  try {
    console.log('\n1️⃣  Testing public API access (no auth)...');
    const user = await fetchGitHub('/users/torvalds');
    console.log(`   ✅ Success: Fetched user "${user.login}" (${user.name})`);
    console.log(`   📊 Public repos: ${user.public_repos}, Followers: ${user.followers}`);
    passed++;
  } catch (error: any) {
    console.error('   ❌ Failed:', error.message);
    failed++;
  }

  // Test 2: Rate limit check
  try {
    console.log('\n2️⃣  Testing rate limit endpoint...');
    const rateLimit = await getRateLimit();
    console.log(`   ✅ Success: Rate limit checked`);
    console.log(`   📊 Limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`);
    console.log(`   ⏱️  Resets at: ${new Date(rateLimit.reset * 1000).toLocaleTimeString()}`);
    passed++;
  } catch (error: any) {
    console.error('   ❌ Failed:', error.message);
    failed++;
  }

  // Test 3: Search repositories
  try {
    console.log('\n3️⃣  Testing repository search...');
    const results = await fetchGitHub<any>('/search/repositories?q=language:rust+stars:>10000&per_page=3&sort=stars&order=desc');
    console.log(`   ✅ Success: Found ${results.total_count} repositories`);
    if (results.items && results.items.length > 0) {
      console.log(`   🔝 Top repo: ${results.items[0].full_name} (⭐ ${results.items[0].stargazers_count})`);
    }
    passed++;
  } catch (error: any) {
    console.error('   ❌ Failed:', error.message);
    failed++;
  }

  // Test 4: Get repository info
  try {
    console.log('\n4️⃣  Testing repository info...');
    const repo = await fetchGitHub('/repos/facebook/react');
    console.log(`   ✅ Success: ${repo.full_name}`);
    console.log(`   📊 Stars: ${repo.stargazers_count}, Forks: ${repo.forks_count}`);
    console.log(`   🏷️  Language: ${repo.language}, License: ${repo.license?.name || 'None'}`);
    passed++;
  } catch (error: any) {
    console.error('   ❌ Failed:', error.message);
    failed++;
  }

  // Test 5: Error handling (404)
  try {
    console.log('\n5️⃣  Testing error handling (404)...');
    try {
      await fetchGitHub('/repos/nonexistent-user-12345/nonexistent-repo-67890');
      console.error('   ❌ Should have thrown error');
      failed++;
    } catch (error: any) {
      if (error instanceof GitHubAPIError && error.status === 404) {
        console.log('   ✅ Success: 404 error handled correctly');
        console.log(`   💬 Error message: "${error.message}"`);
        passed++;
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    console.error('   ❌ Failed:', error.message);
    failed++;
  }

  // Test 6: Auth requirement check
  try {
    console.log('\n6️⃣  Testing auth requirement...');
    try {
      requireAuth(undefined);
      console.error('   ❌ Should have thrown error');
      failed++;
    } catch (error: any) {
      if (error.message.includes('authentication required')) {
        console.log('   ✅ Success: Auth check working');
        console.log(`   💬 Error message: "${error.message}"`);
        passed++;
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    console.error('   ❌ Failed:', error.message);
    failed++;
  }

  // Test 7: Optional token check
  try {
    console.log('\n7️⃣  Testing optional token...');
    const noToken = getOptionalToken(undefined);
    const emptyToken = getOptionalToken('');
    const validToken = getOptionalToken('ghp_abc123');
    
    if (noToken === undefined && emptyToken === undefined && validToken === 'ghp_abc123') {
      console.log('   ✅ Success: Optional token working correctly');
      passed++;
    } else {
      throw new Error('Optional token not working as expected');
    }
  } catch (error: any) {
    console.error('   ❌ Failed:', error.message);
    failed++;
  }

  // Test 8: Token format validation
  try {
    console.log('\n8️⃣  Testing token format validation...');
    const validFormats = [
      'ghp_1234567890abcdefghijklmnopqrstuvwxyz',
      'gho_1234567890abcdefghijklmnopqrstuvwxyz',
      'ghs_1234567890abcdefghijklmnopqrstuvwxyz',
    ];
    const invalidFormats = ['invalid', 'gh_short', 'random_token'];
    
    const allValid = validFormats.every(t => isValidTokenFormat(t));
    const allInvalid = invalidFormats.every(t => !isValidTokenFormat(t));
    
    if (allValid && allInvalid) {
      console.log('   ✅ Success: Token validation working');
      passed++;
    } else {
      throw new Error('Token validation not working correctly');
    }
  } catch (error: any) {
    console.error('   ❌ Failed:', error.message);
    failed++;
  }

  // Test 9: Token masking
  try {
    console.log('\n9️⃣  Testing token masking...');
    const token = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';
    const masked = maskToken(token);
    
    if (masked === 'ghp_123***') {
      console.log('   ✅ Success: Token masking working');
      console.log(`   🔒 Masked: ${token} -> ${masked}`);
      passed++;
    } else {
      throw new Error(`Expected 'ghp_123***', got '${masked}'`);
    }
  } catch (error: any) {
    console.error('   ❌ Failed:', error.message);
    failed++;
  }

  // Test 10: Timeout handling
  try {
    console.log('\n🔟 Testing timeout handling...');
    // This should work normally since we're using a valid endpoint
    const user = await fetchGitHub('/users/octocat', { timeout: 5000 });
    console.log(`   ✅ Success: Request completed within timeout`);
    console.log(`   👤 Fetched: ${user.login}`);
    passed++;
  } catch (error: any) {
    console.error('   ❌ Failed:', error.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}/${passed + failed}`);
  console.log(`❌ Failed: ${failed}/${passed + failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Client is ready to use!');
    console.log('✨ You can now proceed to implement OAuth and tools.');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix before proceeding.');
    process.exit(1);
  }
}

// Run tests only when executed directly (not when bundled)
// For ESM, we check if the file path matches the import.meta.url
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  runTests().catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
}

