import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { createOllama } from "ollama-ai-provider-v2";
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "@/mastra/tools";
import { systemInfoTool } from "@/mastra/tools/system-info";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { Memory } from "@mastra/memory";

export const AgentState = z.object({
  proverbs: z.array(z.string()).default([]),
});

const ollama = createOllama({
  baseURL: process.env.NOS_OLLAMA_API_URL || process.env.OLLAMA_API_URL,
})

export const weatherAgent = new Agent({
  name: "Deus Ex Machina",
  tools: { 
    weatherTool,
    systemInfoTool,
  },
  // model: openai("gpt-4o"), // uncomment this line to use openai
  model: ollama(process.env.NOS_MODEL_NAME_AT_ENDPOINT || process.env.MODEL_NAME_AT_ENDPOINT || "qwen3:8b"), // comment this line to use openai
  instructions: `You are Deus Ex Machina, an AI agent capable of system automation and monitoring.
  
You have access to the following tools:
- **System Info Tool**: Get detailed system metrics (CPU, Memory, Disk, Uptime, Platform)
- **Weather Tool**: Get current weather for any location

When asked about system metrics or computer resources, use the system-info tool.
When asked about weather or temperature, use the weather tool.

Always provide clear, concise, and actionable information.
Format your responses in a helpful and conversational way.`,
  description: "An AI agent that can monitor system metrics and provide weather information.",
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: {
      workingMemory: {
        enabled: true,
        schema: AgentState,
      },
    },
  }),
})
