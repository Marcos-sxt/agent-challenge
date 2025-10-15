/**
 * System Info Tool - Core Logic
 * 
 * Pure functions to collect system information.
 * No dependencies on Mastra or CLI frameworks.
 * Can be tested and reused independently.
 * 
 * Official References:
 * - Node.js os module: https://nodejs.org/api/os.html
 * - Node.js child_process: https://nodejs.org/api/child_process.html
 */

import os from "os";
import { execSync } from "child_process";
import type { SystemInfo, SystemInfoOptions } from "./schemas";

// Tool version (for tracking changes)
const TOOL_VERSION = "1.0.0";

// Optional debug logging
const DEBUG = process.env.SYSTEM_INFO_DEBUG === "true";

function log(...args: any[]) {
  if (DEBUG) {
    console.log("[SystemInfoTool]", ...args);
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Convert bytes to GB (number)
 */
export function bytesToGB(bytes: number): number {
  return Math.round((bytes / (1024 ** 3)) * 100) / 100;
}

/**
 * Format uptime in seconds to readable strings
 */
export function formatUptime(seconds: number): {
  formatted: string;
  human: string;
} {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  // Short format: "5d 12h 34m 56s"
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  const formatted = parts.join(' ');
  
  // Human format: "5 days, 12 hours, 34 minutes"
  const humanParts = [];
  if (days > 0) humanParts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) humanParts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) humanParts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  const human = humanParts.join(', ') || '< 1 minute';
  
  return { formatted, human };
}

/**
 * Get disk information (cross-platform)
 * 
 * Uses different commands per OS:
 * - Windows: wmic
 * - Linux/macOS: df
 */
export function getDiskInfo() {
  const platform = os.platform();
  log("Platform detected:", platform);
  
  try {
    if (platform === 'win32') {
      // Windows: use wmic
      log("Using Windows wmic command");
      const output = execSync(
        'wmic logicaldisk where "DeviceID=\'C:\'" get Size,FreeSpace,FileSystem /format:csv',
        {
          encoding: 'utf-8',
          timeout: 5000,
        }
      ).toString();
      
      const lines = output.split('\n').filter(l => l.trim());
      if (lines.length >= 2) {
        const parts = lines[1].split(',');
        const freeSpace = parseInt(parts[1] || '0');
        const totalSpace = parseInt(parts[2] || '0');
        const usedSpace = totalSpace - freeSpace;
        
        const usedPercent = totalSpace > 0 
          ? Math.round((usedSpace / totalSpace) * 100) 
          : 0;
        
        return {
          total: formatBytes(totalSpace),
          used: formatBytes(usedSpace),
          available: formatBytes(freeSpace),
          usedPercent: `${usedPercent}%`,
          usedRatio: totalSpace > 0 ? Number((usedSpace / totalSpace).toFixed(2)) : null,
          filesystem: parts[0] || 'NTFS',
          mountPoint: 'C:',
        };
      }
    } else {
      // Linux/macOS: use df
      log("Using Unix df command");
      const output = execSync('df -k / | tail -1', {
        encoding: 'utf-8',
        timeout: 5000,
      }).toString();
      
      const parts = output.trim().split(/\s+/);
      
      // df -k returns in 1K blocks
      const totalK = parseInt(parts[1] || '0');
      const usedK = parseInt(parts[2] || '0');
      const availK = parseInt(parts[3] || '0');
      const percentStr = parts[4] || '0%';
      const mountPoint = parts[5] || '/';
      
      const totalBytes = totalK * 1024;
      const usedBytes = usedK * 1024;
      const availBytes = availK * 1024;
      
      const usedPercent = parseInt(percentStr.replace('%', ''));
      
      return {
        total: formatBytes(totalBytes),
        used: formatBytes(usedBytes),
        available: formatBytes(availBytes),
        usedPercent: percentStr,
        usedRatio: totalBytes > 0 ? Number((usedBytes / totalBytes).toFixed(2)) : null,
        filesystem: null, // df doesn't return by default
        mountPoint,
      };
    }
  } catch (error) {
    log("Error getting disk info:", error);
  }
  
  // Fallback if command fails
  return {
    total: 'N/A',
    used: 'N/A',
    available: 'N/A',
    usedPercent: 'N/A',
    usedRatio: null,
    filesystem: null,
    mountPoint: null,
  };
}

/**
 * Get number of physical CPU cores (cross-platform)
 */
export function getPhysicalCores(): number | null {
  const platform = os.platform();
  
  try {
    if (platform === 'win32') {
      const output = execSync('wmic cpu get NumberOfCores', {
        encoding: 'utf-8',
        timeout: 3000,
      }).toString();
      const lines = output.split('\n').filter(l => l.trim() && !l.includes('NumberOfCores'));
      if (lines.length > 0) {
        return parseInt(lines[0].trim());
      }
    } else if (platform === 'darwin') {
      // macOS
      const output = execSync('sysctl -n hw.physicalcpu', {
        encoding: 'utf-8',
        timeout: 3000,
      }).toString();
      return parseInt(output.trim());
    } else {
      // Linux
      const output = execSync('lscpu | grep "Core(s) per socket"', {
        encoding: 'utf-8',
        timeout: 3000,
      }).toString();
      const match = output.match(/(\d+)/);
      if (match) {
        const coresPerSocket = parseInt(match[1]);
        const socketsOutput = execSync('lscpu | grep "Socket(s)"', {
          encoding: 'utf-8',
          timeout: 3000,
        }).toString();
        const socketsMatch = socketsOutput.match(/(\d+)/);
        if (socketsMatch) {
          const sockets = parseInt(socketsMatch[1]);
          return coresPerSocket * sockets;
        }
        return coresPerSocket;
      }
    }
  } catch (error) {
    log("Could not get physical cores:", error);
  }
  
  return null;
}

/**
 * Get current user (if available)
 */
export function getCurrentUser(): string | null {
  try {
    return os.userInfo().username;
  } catch {
    return null;
  }
}

/**
 * Main function to get all system information
 */
export async function getSystemInfo(options: SystemInfoOptions = {}): Promise<SystemInfo> {
  const startTime = Date.now();
  log("=== System Info Tool V1 Started ===");
  
  try {
    // CPU INFO
    log("Gathering CPU info...");
    const cpus = os.cpus();
    const speedMHz = cpus[0]?.speed || 0;
    const speedGHz = speedMHz > 0 ? Number((speedMHz / 1000).toFixed(2)) : null;
    const physicalCores = getPhysicalCores();
    
    // Load average (doesn't work on Windows)
    let loadAverage: number[] | null = null;
    try {
      const loads = os.loadavg();
      if (loads && loads.length > 0 && loads[0] !== 0) {
        loadAverage = loads.map(l => Number(l.toFixed(2)));
      }
    } catch {
      loadAverage = null;
    }
    
    const cpu = {
      model: cpus[0]?.model || 'Unknown',
      cores: cpus.length,
      physicalCores,
      speedGHz,
      speedMHz: speedMHz || null,
      loadAverage,
    };
    
    // MEMORY INFO
    log("Gathering Memory info...");
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usedPercent = Math.round((usedMem / totalMem) * 100);
    const usedRatio = Number((usedMem / totalMem).toFixed(2));
    
    const memory = {
      totalGB: bytesToGB(totalMem),
      freeGB: bytesToGB(freeMem),
      usedGB: bytesToGB(usedMem),
      usedPercent,
      usedRatio,
      total: formatBytes(totalMem),
      free: formatBytes(freeMem),
      used: formatBytes(usedMem),
    };
    
    // DISK INFO
    log("Gathering Disk info...");
    const disk = getDiskInfo();
    
    // UPTIME
    log("Gathering Uptime info...");
    const uptimeSeconds = os.uptime();
    const uptimeFormatted = formatUptime(uptimeSeconds);
    
    const uptime = {
      seconds: uptimeSeconds,
      formatted: uptimeFormatted.formatted,
      human: uptimeFormatted.human,
    };
    
    // PLATFORM INFO
    log("Gathering Platform info...");
    const platform = {
      type: os.type(),
      release: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      user: getCurrentUser(),
    };
    
    // FINAL RESULT
    const result: SystemInfo = {
      tool_version: TOOL_VERSION,
      timestamp: new Date().toISOString(),
      cpu,
      memory,
      disk,
      uptime,
      platform,
    };
    
    const elapsed = Date.now() - startTime;
    log(`=== System Info Tool V1 Completed in ${elapsed}ms ===`);
    
    return result;
    
  } catch (error) {
    log("ERROR:", error);
    throw error;
  }
}

