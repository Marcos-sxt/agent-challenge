import { z } from "zod";

/**
 * System Info Tool Schemas
 * 
 * Resilient schemas with nullable/optional fields
 * to prevent failures if some metrics can't be collected
 */

export const SystemInfoOutputSchema = z.object({
  tool_version: z.string(),
  timestamp: z.string(),
  
  cpu: z.object({
    model: z.string(),
    cores: z.number(),
    physicalCores: z.number().nullable(),
    speedGHz: z.number().nullable(),
    speedMHz: z.number().nullable(),
    loadAverage: z.array(z.number()).nullable(),
  }),
  
  memory: z.object({
    totalGB: z.number(),
    freeGB: z.number(),
    usedGB: z.number(),
    usedPercent: z.number(),
    usedRatio: z.number(), // 0.0 - 1.0 for UI progress bars
    // Human-readable formatted strings
    total: z.string(),
    free: z.string(),
    used: z.string(),
  }),
  
  disk: z.object({
    total: z.string(),
    used: z.string(),
    available: z.string(),
    usedPercent: z.string(),
    usedRatio: z.number().nullable(), // 0.0 - 1.0 for UI progress bars
    filesystem: z.string().nullable(),
    mountPoint: z.string().nullable(),
  }),
  
  uptime: z.object({
    seconds: z.number(),
    formatted: z.string(), // e.g. "5d 12h 34m 56s"
    human: z.string(), // e.g. "5 days, 12 hours"
  }),
  
  platform: z.object({
    type: z.string(), // Linux, Darwin, Windows_NT
    release: z.string(),
    arch: z.string(), // x64, arm64, etc
    hostname: z.string(),
    user: z.string().nullable(),
  }),
});

export type SystemInfo = z.infer<typeof SystemInfoOutputSchema>;

export interface SystemInfoOptions {
  detailed?: boolean;
  format?: 'json' | 'text' | 'compact';
}

