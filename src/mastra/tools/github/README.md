# GitHub Tools Suite

Complete GitHub integration for Deus Ex Machina agent with read-only and write capabilities.

## 📦 Phase 1: Read-Only Tools (COMPLETED ✅)

### Tools Implemented

1. **`github-search`** - Search GitHub for repositories, users, or code
2. **`github-repo-info`** - Get detailed repository information
3. **`github-list-issues`** - List and filter repository issues
4. **`github-user-info`** - Get user profile information

### Features

- ✅ **No authentication required** for read operations
- ✅ **Rate limit monitoring** built-in
- ✅ **User-friendly error messages**
- ✅ **Standalone CLI** for isolated testing
- ✅ **Full type safety** with Zod schemas
- ✅ **Resilient error handling**
- ✅ **Tested with real API calls**

---

## 🚀 Quick Start

### 1. Import Tools in Agent

```typescript
import { githubTools } from './tools/github';

// Register all GitHub tools at once
agent.registerTools(githubTools);

// Or register individually
import { 
  githubSearchTool,
  githubRepoInfoTool,
  githubListIssuesTool,
  githubUserInfoTool,
} from './tools/github';

agent.registerTools([
  githubSearchTool,
  githubRepoInfoTool,
  githubListIssuesTool,
  githubUserInfoTool,
]);
```

### 2. Test with CLI

```bash
# Search repositories
tsx src/mastra/tools/github/cli.ts search repositories "language:rust stars:>1000" --limit 5

# Get repository info
tsx src/mastra/tools/github/cli.ts repo-info facebook react --include branches,release

# List issues
tsx src/mastra/tools/github/cli.ts issues microsoft vscode --state open --limit 10

# Get user info
tsx src/mastra/tools/github/cli.ts user-info torvalds --include repos
```

### 3. Use in Agent Chat

```
User: "Search GitHub for popular TypeScript projects with more than 5000 stars"
Agent: [Uses github-search tool]

User: "Show me details about the facebook/react repository"
Agent: [Uses github-repo-info tool]

User: "List the latest open bugs in microsoft/vscode"
Agent: [Uses github-list-issues tool]

User: "Tell me about the GitHub user torvalds"
Agent: [Uses github-user-info tool]
```

---

## 📚 Tool Documentation

### 1. GitHub Search (`github-search`)

Search GitHub for repositories, users, or code.

**Input:**
```typescript
{
  type: 'repositories' | 'users' | 'code',
  query: string,          // GitHub search query
  sort?: string,          // Sort order
  limit?: number,         // Max results (default: 5)
}
```

**Output:**
```typescript
{
  type: string,
  total_count: number,
  showing: number,
  results: Array<...>     // Results depend on type
}
```

**Examples:**
- `"language:rust stars:>1000"` - Popular Rust projects
- `"user:microsoft"` - All Microsoft repos
- `"topic:machine-learning"` - ML projects

**Rate Limits:** 10 req/min (unauthenticated), 30 req/min (authenticated)

---

### 2. Repository Info (`github-repo-info`)

Get detailed information about a GitHub repository.

**Input:**
```typescript
{
  owner: string,
  repo: string,
  include?: ['branches', 'release', 'commits'],  // Optional extended info
}
```

**Output:**
```typescript
{
  name: string,
  full_name: string,
  description: string | null,
  owner: { login, avatar_url, type },
  html_url: string,
  homepage: string | null,
  language: string | null,
  license: { name, key } | null,
  stargazers_count: number,
  forks_count: number,
  open_issues_count: number,
  default_branch: string,
  topics: string[],
  created_at: string,
  updated_at: string,
  
  // Optional
  branches?: Array<...>,
  latest_release?: {...},
  recent_commits?: Array<...>,
}
```

**Examples:**
- `owner: "facebook", repo: "react"`
- `owner: "microsoft", repo: "vscode", include: ["branches", "release"]`

---

### 3. List Issues (`github-list-issues`)

List and filter issues from a GitHub repository.

**Input:**
```typescript
{
  owner: string,
  repo: string,
  state?: 'open' | 'closed' | 'all',     // Default: 'open'
  labels?: string,                        // Comma-separated
  limit?: number,                         // Default: 10, max: 50
  sort?: 'created' | 'updated' | 'comments',
}
```

**Output:**
```typescript
{
  total: number,
  state_filter: string,
  issues: Array<{
    number: number,
    title: string,
    state: string,
    body: string | null,
    user: { login, avatar_url },
    labels: Array<{ name, color }>,
    comments: number,
    created_at: string,
    updated_at: string,
    html_url: string,
    is_pull_request: boolean,
  }>
}
```

**Note:** This tool filters out pull requests and returns only issues.

**Examples:**
- `owner: "microsoft", repo: "vscode", state: "open"`
- `owner: "facebook", repo: "react", labels: "bug,help-wanted", limit: 20`

---

### 4. User Info (`github-user-info`)

Get detailed information about a GitHub user or organization.

**Input:**
```typescript
{
  username: string,
  include?: ['repos', 'starred'],  // Optional extended info
}
```

**Output:**
```typescript
{
  login: string,
  name: string | null,
  avatar_url: string,
  html_url: string,
  type: string,                    // "User" or "Organization"
  bio: string | null,
  company: string | null,
  location: string | null,
  blog: string | null,
  email: string | null,
  twitter_username: string | null,
  public_repos: number,
  public_gists: number,
  followers: number,
  following: number,
  created_at: string,
  updated_at: string,
  
  // Optional
  repos?: Array<...>,              // 5 most recent repos
  starred?: Array<...>,            // 5 most recent starred
}
```

**Examples:**
- `username: "torvalds"`
- `username: "microsoft", include: ["repos"]`

---

## ⚡ Rate Limits

GitHub API has different rate limits:

| Auth Status | Core API | Search API |
|-------------|----------|------------|
| **Unauthenticated** | 60 req/hour | 10 req/min |
| **Authenticated** | 5000 req/hour | 30 req/min |

**How to increase limits:**
Set `GITHUB_TOKEN` environment variable with a Personal Access Token.

---

## 🧪 Testing

### Core Infrastructure Tests

```bash
# Test API client (10 tests)
tsx src/mastra/tools/github/core/test-client.ts
```

### CLI Tests

```bash
# Test all tools
tsx src/mastra/tools/github/cli.ts help
tsx src/mastra/tools/github/cli.ts search repositories "language:rust" --limit 3
tsx src/mastra/tools/github/cli.ts repo-info facebook react
tsx src/mastra/tools/github/cli.ts issues microsoft vscode --limit 5
tsx src/mastra/tools/github/cli.ts user-info torvalds
```

---

## 📂 Project Structure

```
src/mastra/tools/github/
├── types.ts                    # TypeScript type definitions
├── schemas.ts                  # Zod validation schemas
├── index.ts                    # Main export (use this!)
├── cli.ts                      # Standalone CLI for testing
├── README.md                   # This file
│
├── core/
│   ├── auth.ts                 # Authentication helpers
│   ├── client.ts               # GitHub API client
│   └── test-client.ts          # Client test suite (10/10 passed)
│
└── tools/
    ├── search.ts               # Search tool
    ├── repo-info.ts            # Repository info tool
    ├── issues.ts               # Issues list tool
    └── user-info.ts            # User info tool
```

---

## ✅ Implementation Status

### Phase 1: Read-Only Tools (COMPLETED)
- ✅ Core infrastructure (types, schemas, client)
- ✅ Authentication helpers
- ✅ API client with retry and error handling
- ✅ 4 read-only tools
- ✅ Standalone CLI
- ✅ Complete documentation
- ✅ All tools tested with real API

### Phase 2: OAuth Setup (TODO)
- ⏳ GitHub OAuth App
- ⏳ Next.js API routes
- ⏳ Frontend auth component

### Phase 3: Write Tools (TODO)
- ⏳ Create repository
- ⏳ Fork repository
- ⏳ Create/update files
- ⏳ Create/comment issues
- ⏳ Create/merge PRs
- ⏳ Star/watch repositories
- ⏳ Follow users

---

## 🔗 References

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [Technical Documentation](../../../docs/notes/2025-10-16_github-api-technical-documentation.md)
- [Implementation Plan](../../../docs/notes/2025-10-16_github-tool-implementation-plan.md)
- [Blueprint](../../../docs/notes/2025-10-17_github-tools-readonly-blueprint.md)

---

## 🎯 Next Steps

1. Register tools in Mastra agent (`src/mastra/agents/index.ts`)
2. Test via chat interface
3. (Optional) Implement OAuth for write operations
4. (Optional) Implement write tools

---

**Status:** ✅ Phase 1 Complete - Ready for Production  
**Created:** 2025-10-17  
**Author:** AI Implementation for Deus Ex Machina MVP  
**Tools:** 4 read-only tools, fully tested


