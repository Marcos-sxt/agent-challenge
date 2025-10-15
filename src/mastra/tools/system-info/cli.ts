#!/usr/bin/env tsx
/**
 * System Info Tool - CLI Interface
 * 
 * Standalone CLI to test and use the system info tool
 * without running the full Mastra agent.
 * 
 * Usage:
 *   tsx src/mastra/tools/system-info/cli.ts [options]
 * 
 * Options:
 *   --help        Show help message
 *   --json        Output as JSON
 *   --detailed    Include detailed metrics
 *   --compact     Compact output
 *   --version     Show tool version
 */

import { getSystemInfo } from "./core";

const HELP_TEXT = `
System Info Tool - CLI

Usage:
  tsx src/mastra/tools/system-info/cli.ts [options]

Options:
  --help        Show this help message
  --json        Output as JSON
  --detailed    Include detailed metrics
  --compact     Compact single-line output
  --version     Show tool version

Examples:
  # Default output
  tsx src/mastra/tools/system-info/cli.ts

  # JSON output
  tsx src/mastra/tools/system-info/cli.ts --json

  # Pipe to jq
  tsx src/mastra/tools/system-info/cli.ts --json | jq '.memory'

  # Compact monitoring
  watch -n 5 'tsx src/mastra/tools/system-info/cli.ts --compact'
`;

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const showHelp = args.includes('--help') || args.includes('-h');
  const outputJson = args.includes('--json');
  const detailed = args.includes('--detailed');
  const compact = args.includes('--compact');
  const showVersion = args.includes('--version');
  
  // Show help
  if (showHelp) {
    console.log(HELP_TEXT);
    process.exit(0);
  }
  
  // Show version
  if (showVersion) {
    console.log('1.0.0');
    process.exit(0);
  }
  
  try {
    // Get system info
    const result = await getSystemInfo({ detailed });
    
    // Output based on format
    if (outputJson) {
      // JSON output
      console.log(JSON.stringify(result, null, 2));
    } else if (compact) {
      // Compact single-line output
      console.log(
        `CPU: ${result.cpu.cores}c @ ${result.cpu.speedGHz || 'N/A'}GHz | ` +
        `MEM: ${result.memory.usedPercent}% (${result.memory.used}/${result.memory.total}) | ` +
        `DISK: ${result.disk.usedPercent} | ` +
        `UP: ${result.uptime.formatted}`
      );
    } else {
      // Default formatted output
      console.log('=== System Information ===\n');
      
      console.log('CPU:');
      console.log(`  Model: ${result.cpu.model}`);
      console.log(`  Cores: ${result.cpu.cores} logical${result.cpu.physicalCores ? ` (${result.cpu.physicalCores} physical)` : ''}`);
      if (result.cpu.speedGHz) {
        console.log(`  Speed: ${result.cpu.speedGHz} GHz`);
      }
      if (result.cpu.loadAverage) {
        console.log(`  Load Average: ${result.cpu.loadAverage.join(', ')}`);
      }
      
      console.log('\nMemory:');
      console.log(`  Total: ${result.memory.total}`);
      console.log(`  Used: ${result.memory.used} (${result.memory.usedPercent}%)`);
      console.log(`  Free: ${result.memory.free}`);
      
      console.log('\nDisk:');
      console.log(`  Total: ${result.disk.total}`);
      console.log(`  Used: ${result.disk.used} (${result.disk.usedPercent})`);
      console.log(`  Available: ${result.disk.available}`);
      if (result.disk.mountPoint) {
        console.log(`  Mount: ${result.disk.mountPoint}`);
      }
      if (result.disk.filesystem) {
        console.log(`  Filesystem: ${result.disk.filesystem}`);
      }
      
      console.log('\nUptime:');
      console.log(`  ${result.uptime.human} (${result.uptime.formatted})`);
      
      console.log('\nPlatform:');
      console.log(`  OS: ${result.platform.type} ${result.platform.release}`);
      console.log(`  Arch: ${result.platform.arch}`);
      console.log(`  Hostname: ${result.platform.hostname}`);
      if (result.platform.user) {
        console.log(`  User: ${result.platform.user}`);
      }
      
      console.log(`\nTimestamp: ${result.timestamp}`);
      console.log(`Tool Version: ${result.tool_version}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

