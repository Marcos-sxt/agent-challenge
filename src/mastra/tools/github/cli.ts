#!/usr/bin/env node
/**
 * GitHub Tools - Standalone CLI for Testing
 * Test all GitHub tools independently before agent integration
 * 
 * Usage:
 *   tsx src/mastra/tools/github/cli.ts search repositories "language:rust stars:>1000" --limit 3
 *   tsx src/mastra/tools/github/cli.ts repo-info facebook react --include branches,release
 *   tsx src/mastra/tools/github/cli.ts issues microsoft vscode --state open --limit 5
 *   tsx src/mastra/tools/github/cli.ts user-info torvalds --include repos
 */

import { githubSearch } from './tools/search';
import { githubRepoInfo } from './tools/repo-info';
import { githubListIssues } from './tools/issues';
import { githubUserInfo } from './tools/user-info';

// Get GitHub token from environment (optional)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Helper to format JSON output
function formatOutput(data: any): string {
  return JSON.stringify(data, null, 2);
}

// Helper to parse CLI arguments
function parseArgs(): any {
  const args = process.argv.slice(2);
  const command = args[0];
  const params: any = {};
  
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1];
      
      // Handle comma-separated values
      if (value && value.includes(',')) {
        params[key] = value.split(',');
      } else if (value && !value.startsWith('--')) {
        // Try to parse as number
        params[key] = isNaN(Number(value)) ? value : Number(value);
        i++; // Skip next arg
      } else {
        params[key] = true;
      }
    } else if (!command) {
      // First non-flag arg
      params._command = args[i];
    } else {
      // Positional arguments
      if (!params._args) params._args = [];
      params._args.push(args[i]);
    }
  }
  
  return { command: command || params._command, params };
}

// Command handlers
async function handleSearch(params: any) {
  const [type, query] = params._args || [];
  
  if (!type || !query) {
    console.error('❌ Usage: search <type> <query> [--sort <sort>] [--limit <n>]');
    console.error('   Types: repositories, users, code');
    console.error('   Example: search repositories "language:rust stars:>1000" --limit 5');
    process.exit(1);
  }

  console.log(`🔍 Searching ${type} for: "${query}"`);
  if (params.sort) console.log(`   Sort: ${params.sort}`);
  if (params.limit) console.log(`   Limit: ${params.limit}`);
  console.log();

  const result = await githubSearch(type as any, query, {
    sort: params.sort,
    limit: params.limit,
    token: GITHUB_TOKEN,
  });

  console.log('✅ Results:');
  console.log(formatOutput(result));
}

async function handleRepoInfo(params: any) {
  const [owner, repo] = params._args || [];
  
  if (!owner || !repo) {
    console.error('❌ Usage: repo-info <owner> <repo> [--include branches,release,commits]');
    console.error('   Example: repo-info facebook react --include branches,release');
    process.exit(1);
  }

  console.log(`📦 Getting repository info: ${owner}/${repo}`);
  if (params.include) {
    const includeList = Array.isArray(params.include) ? params.include : [params.include];
    console.log(`   Include: ${includeList.join(', ')}`);
  }
  console.log();

  const result = await githubRepoInfo(owner, repo, {
    include: params.include,
    token: GITHUB_TOKEN,
  });

  console.log('✅ Repository Info:');
  console.log(formatOutput(result));
}

async function handleIssues(params: any) {
  const [owner, repo] = params._args || [];
  
  if (!owner || !repo) {
    console.error('❌ Usage: issues <owner> <repo> [--state open|closed|all] [--labels bug,help] [--limit <n>]');
    console.error('   Example: issues microsoft vscode --state open --labels bug --limit 5');
    process.exit(1);
  }

  console.log(`🎫 Listing issues: ${owner}/${repo}`);
  if (params.state) console.log(`   State: ${params.state}`);
  if (params.labels) console.log(`   Labels: ${params.labels}`);
  if (params.limit) console.log(`   Limit: ${params.limit}`);
  console.log();

  const result = await githubListIssues(owner, repo, {
    state: params.state,
    labels: params.labels,
    limit: params.limit,
    token: GITHUB_TOKEN,
  });

  console.log(`✅ Found ${result.total} issues:`);
  console.log(formatOutput(result));
}

async function handleUserInfo(params: any) {
  const [username] = params._args || [];
  
  if (!username) {
    console.error('❌ Usage: user-info <username> [--include repos,starred]');
    console.error('   Example: user-info torvalds --include repos');
    process.exit(1);
  }

  console.log(`👤 Getting user info: ${username}`);
  if (params.include) {
    const includeList = Array.isArray(params.include) ? params.include : [params.include];
    console.log(`   Include: ${includeList.join(', ')}`);
  }
  console.log();

  const result = await githubUserInfo(username, {
    include: params.include,
    token: GITHUB_TOKEN,
  });

  console.log('✅ User Info:');
  console.log(formatOutput(result));
}

// Help text
function showHelp() {
  console.log(`
🐙 GitHub Tools - Standalone CLI

USAGE:
  tsx src/mastra/tools/github/cli.ts <command> [options]

COMMANDS:
  search <type> <query>        Search GitHub
    Types: repositories, users, code
    Options: --sort <sort> --limit <n>
    Example: search repositories "language:rust stars:>1000" --limit 5

  repo-info <owner> <repo>     Get repository information
    Options: --include branches,release,commits
    Example: repo-info facebook react --include branches,release

  issues <owner> <repo>        List repository issues
    Options: --state <state> --labels <labels> --limit <n>
    Example: issues microsoft vscode --state open --limit 10

  user-info <username>         Get user profile information
    Options: --include repos,starred
    Example: user-info torvalds --include repos

ENVIRONMENT:
  GITHUB_TOKEN                 Optional: GitHub token for higher rate limits
                               (60 req/h without, 5000 req/h with token)

EXAMPLES:
  # Search for popular Rust projects
  tsx src/mastra/tools/github/cli.ts search repositories "language:rust stars:>1000" --limit 3

  # Get React repository info with branches
  tsx src/mastra/tools/github/cli.ts repo-info facebook react --include branches,release

  # List open bugs in VSCode
  tsx src/mastra/tools/github/cli.ts issues microsoft vscode --state open --labels bug --limit 5

  # Get Linus Torvalds profile with repos
  tsx src/mastra/tools/github/cli.ts user-info torvalds --include repos

RATE LIMITS:
  Without token: 60 requests/hour, 10 searches/minute
  With token:    5000 requests/hour, 30 searches/minute
  
  Set GITHUB_TOKEN environment variable to increase limits.
`);
}

// Main CLI
async function main() {
  const { command, params } = parseArgs();

  // Show help if no command or --help flag
  if (!command || params.help || command === 'help') {
    showHelp();
    process.exit(0);
  }

  console.log('🐙 GitHub Tools CLI\n');
  console.log('='.repeat(60));

  try {
    switch (command) {
      case 'search':
        await handleSearch(params);
        break;

      case 'repo-info':
        await handleRepoInfo(params);
        break;

      case 'issues':
        await handleIssues(params);
        break;

      case 'user-info':
        await handleUserInfo(params);
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.error('   Run with --help to see available commands');
        process.exit(1);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Command completed successfully!');
  } catch (error: any) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

// Run CLI only when executed directly (not when imported)
// Check if this file is being run as the main module
// For ESM, we check if the file path matches the import.meta.url
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main();
}

