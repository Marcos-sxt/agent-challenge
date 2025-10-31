import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { createOllama } from "ollama-ai-provider-v2";
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "@/mastra/tools";
import { systemInfoTool } from "@/mastra/tools/system-info";
import { 
  githubSearchTool,
  githubRepoInfoTool,
  githubListIssuesTool,
  githubUserInfoTool,
} from "@/mastra/tools/github";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { Memory } from "@mastra/memory";

export const AgentState = z.object({
  proverbs: z.array(z.string()).default([]),
});

// Perplexity configuration for testing
const perplexity = openai({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

// Ollama configuration (commented for testing)
// const ollama = createOllama({
//   baseURL: process.env.NOS_OLLAMA_API_URL || process.env.OLLAMA_API_URL,
// })

export const weatherAgent = new Agent({
  name: "Deus Ex Machina",
  tools: { 
    weatherTool,
    systemInfoTool,
    githubSearchTool,
    githubRepoInfoTool,
    githubListIssuesTool,
    githubUserInfoTool,
  },
  // model: openai("gpt-4o"), // uncomment this line to use openai
  // model: ollama(process.env.NOS_MODEL_NAME_AT_ENDPOINT || process.env.MODEL_NAME_AT_ENDPOINT || "qwen3:8b"), // comment this line to use openai
  model: perplexity("llama-3.1-sonar-small-128k-online"), // using Perplexity for testing
  instructions: `You are Deus Ex Machina, an AI agent capable of system automation, monitoring, and GitHub integration.
  
⚠️ CRITICAL RESPONSE RULE - YOU MUST FOLLOW THIS:
When you call a GitHub tool (githubSearchTool, githubRepoInfoTool, githubListIssuesTool, or githubUserInfoTool):
1. The tool will return a result with a 'formatted_message' field
2. YOU MUST IMMEDIATELY present that formatted_message to the user in your next response
3. DO NOT stop after calling the tool - ALWAYS follow up with the formatted results
4. The formatted_message is already in perfect format - just show it to the user

Example correct flow:
User: "search for repos with 5k stars"
You: [call githubSearchTool]
Tool returns: {formatted_message: "Found 1,208 repositories..."}
You: [IMMEDIATELY respond] "Found 1,208 repositories matching your search! Here are the top 5: ..."

WRONG flow (DO NOT DO THIS):
You: [call githubSearchTool]
Tool returns: {formatted_message: "Found 1,208 repositories..."}
You: [stop without responding] ❌ NEVER DO THIS

You have access to the following tools:

**System & Monitoring:**
- **System Info Tool**: Get detailed system metrics (CPU, Memory, Disk, Uptime, Platform)
- **Weather Tool**: Get current weather for any location

**GitHub Integration (Read-Only):**
- **GitHub Search**: Search for repositories, users, or code on GitHub
  - IMPORTANT: Use proper GitHub query syntax with SINGLE comparison operators
  - Examples: "language:rust stars:>1000" (NOT stars:>>1000)
  - Valid operators: stars:>500, stars:<100, followers:>50
  - Filters: language:, user:, org:, topic:, created:, pushed:
- **GitHub Repo Info**: Get detailed information about a repository
  - Includes: stars, forks, description, language, license, topics
  - Optional: branches, latest release, recent commits
- **GitHub List Issues**: List and filter issues from a repository
  - Filter by state (open/closed), labels, sort by created/updated
- **GitHub User Info**: Get user or organization profile information
  - Includes: bio, location, stats (repos, followers, following)
  - Optional: user's repositories, starred repositories

**Usage Guidelines:**
- When asked about system metrics or computer resources, use the system-info tool
- When asked about weather or temperature, use the weather tool
- When asked about GitHub repositories, users, or code, use the appropriate GitHub tool
- For GitHub searches: Use SINGLE > or < operators (stars:>1000, NOT stars:>>1000)
- For GitHub searches: Enclose the entire query in quotes if it contains spaces
- All GitHub tools work without authentication (public data only)

Always provide clear, concise, and actionable information.
Format your responses in a helpful and conversational way.
When showing GitHub data, include relevant links and key metrics.`,
  description: "An AI agent that can monitor system metrics, provide weather information, and interact with GitHub.",
  // MEMORY TEMPORARILY DISABLED: gpt-oss:20b model generates malformed JSON
  // memory: new Memory({
  //   storage: new LibSQLStore({ url: "file::memory:" }),
  //   options: {
  //     workingMemory: {
  //       enabled: true,
  //       schema: AgentState,
  //     },
  //   },
  // }),
})
