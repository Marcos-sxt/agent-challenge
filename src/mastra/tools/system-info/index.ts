/**
 * System Info Tool - Mastra Integration
 * 
 * This file wraps the core logic into a Mastra Tool
 * that can be called by the AI agent.
 * 
 * Official Reference: https://mastra.ai/docs/tools
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getSystemInfo } from "./core";
import { SystemInfoOutputSchema } from "./schemas";

export const systemInfoTool = createTool({
  id: "get-system-info",
  description: "Get comprehensive system information including CPU, Memory, Disk usage, System uptime and Platform details. Returns detailed metrics suitable for monitoring and diagnostics.",
  inputSchema: z.object({
    detailed: z.boolean().optional().describe("Include detailed metrics (default: false)"),
  }),
  outputSchema: SystemInfoOutputSchema,
  execute: async ({ context }) => {
    return await getSystemInfo({
      detailed: context.detailed,
    });
  },
});

// Export types for external use
export type { SystemInfo, SystemInfoOptions } from "./schemas";

