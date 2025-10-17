# GitHub Tools Read-Only — Blueprint

**Date:** 2025-10-17  
**Context:** First phase implementation - 4 read-only tools  
**Based on:** System Info Tool pattern + GitHub API docs  
**Status:** Ready for validation ✅

---

## 🎯 ARCHITECTURE PATTERN

### **Following System Info Tool Structure:**

```
src/mastra/tools/github/
├── types.ts           ✅ DONE (base types)
├── core/
│   ├── auth.ts        ✅ DONE (auth helpers)
│   ├── client.ts      ✅ DONE (API client)
│   └── test-client.ts ✅ DONE (10/10 tests passed)
│
├── schemas.ts         🔧 TO IMPLEMENT (Zod schemas for all tools)
│
├── tools/
│   ├── search.ts          🔧 Tool 1: Search repos/users/code
│   ├── repo-info.ts       🔧 Tool 2: Get repo details
│   ├── issues.ts          🔧 Tool 3: List issues
│   └── user-info.ts       🔧 Tool 4: Get user profile
│
└── cli.ts             🔧 TO IMPLEMENT (standalone CLI for testing)
```

---

## 📦 TOOL 1: SEARCH

**ID:** `github-search`  
**Auth Required:** No (public API, 10 req/min)  
**Description:** Search GitHub for repositories, users, or code

### **Input Schema:**
```typescript
{
  type: 'repositories' | 'users' | 'code',
  query: string,          // e.g., "language:rust stars:>1000"
  limit?: number,         // default: 5, max: 30
  sort?: string,          // 'stars', 'forks', 'updated'
}
```

### **Output Schema:**
```typescript
{
  type: string,
  total_count: number,
  results: Array<{
    name: string,
    full_name: string,      // for repos
    login?: string,         // for users
    description: string | null,
    html_url: string,
    stars?: number,         // for repos
    language?: string,      // for repos
  }>
}
```

### **Core Function:**
```typescript
async function search(type, query, options) {
  const endpoint = `/search/${type}?q=${query}&per_page=${limit}&sort=${sort}`;
  return await fetchGitHub(endpoint);
}
```

### **Example Usage:**
```bash
# CLI
github-cli search --type repositories --query "language:typescript stars:>5000" --limit 5

# Agent
"Search GitHub for popular TypeScript projects with more than 5000 stars"
```

---

## 📦 TOOL 2: REPOSITORY INFO

**ID:** `github-repo-info`  
**Auth Required:** No (public repos)  
**Description:** Get detailed information about a GitHub repository

### **Input Schema:**
```typescript
{
  owner: string,          // e.g., "facebook"
  repo: string,           // e.g., "react"
  include?: string[],     // optional: ['branches', 'release', 'commits']
}
```

### **Output Schema:**
```typescript
{
  name: string,
  full_name: string,
  description: string | null,
  owner: {
    login: string,
    avatar_url: string,
  },
  html_url: string,
  homepage: string | null,
  language: string | null,
  license: string | null,
  stars: number,
  forks: number,
  open_issues: number,
  watchers: number,
  default_branch: string,
  topics: string[],
  created_at: string,
  updated_at: string,
  pushed_at: string,
  
  // Optional extended info
  branches?: Array<{ name: string, protected: boolean }>,
  latest_release?: {
    tag_name: string,
    name: string,
    published_at: string,
    html_url: string,
  },
  recent_commits?: Array<{
    sha: string,
    message: string,
    author: string,
    date: string,
  }>,
}
```

### **Core Function:**
```typescript
async function getRepoInfo(owner, repo, include) {
  const repo = await fetchGitHub(`/repos/${owner}/${repo}`);
  
  // Optionally fetch extended info
  if (include?.includes('branches')) {
    repo.branches = await fetchGitHub(`/repos/${owner}/${repo}/branches`);
  }
  if (include?.includes('release')) {
    repo.latest_release = await fetchGitHub(`/repos/${owner}/${repo}/releases/latest`);
  }
  
  return repo;
}
```

### **Example Usage:**
```bash
# CLI
github-cli repo-info --owner facebook --repo react --include branches,release

# Agent
"Show me detailed information about the facebook/react repository including branches and latest release"
```

---

## 📦 TOOL 3: ISSUES

**ID:** `github-list-issues`  
**Auth Required:** No (public repos)  
**Description:** List issues from a GitHub repository

### **Input Schema:**
```typescript
{
  owner: string,
  repo: string,
  state?: 'open' | 'closed' | 'all',  // default: 'open'
  labels?: string,                      // comma-separated: "bug,help-wanted"
  limit?: number,                       // default: 10, max: 50
  sort?: 'created' | 'updated' | 'comments',
}
```

### **Output Schema:**
```typescript
{
  total: number,
  state_filter: string,
  issues: Array<{
    number: number,
    title: string,
    state: string,
    body: string | null,
    user: {
      login: string,
      avatar_url: string,
    },
    labels: Array<{
      name: string,
      color: string,
    }>,
    comments: number,
    created_at: string,
    updated_at: string,
    html_url: string,
    is_pull_request: boolean,
  }>
}
```

### **Core Function:**
```typescript
async function listIssues(owner, repo, options) {
  let endpoint = `/repos/${owner}/${repo}/issues?state=${state}&per_page=${limit}`;
  
  if (options.labels) {
    endpoint += `&labels=${options.labels}`;
  }
  if (options.sort) {
    endpoint += `&sort=${options.sort}`;
  }
  
  const issues = await fetchGitHub(endpoint);
  
  // Filter out pull requests (GitHub API returns both)
  const onlyIssues = issues.filter(issue => !issue.pull_request);
  
  return {
    total: onlyIssues.length,
    state_filter: state,
    issues: onlyIssues,
  };
}
```

### **Example Usage:**
```bash
# CLI
github-cli issues --owner microsoft --repo vscode --state open --labels bug --limit 10

# Agent
"Show me the latest 10 open bug issues in microsoft/vscode"
```

---

## 📦 TOOL 4: USER INFO

**ID:** `github-user-info`  
**Auth Required:** No (public profiles)  
**Description:** Get detailed information about a GitHub user

### **Input Schema:**
```typescript
{
  username: string,           // e.g., "torvalds"
  include?: string[],         // optional: ['repos', 'starred']
}
```

### **Output Schema:**
```typescript
{
  login: string,
  name: string | null,
  avatar_url: string,
  html_url: string,
  type: string,               // "User" or "Organization"
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
  
  // Optional extended info
  repos?: Array<{
    name: string,
    full_name: string,
    description: string | null,
    stars: number,
    language: string | null,
    html_url: string,
  }>,
  starred?: Array<{
    name: string,
    full_name: string,
    description: string | null,
    stars: number,
    html_url: string,
  }>,
}
```

### **Core Function:**
```typescript
async function getUserInfo(username, include) {
  const user = await fetchGitHub(`/users/${username}`);
  
  // Optionally fetch extended info
  if (include?.includes('repos')) {
    user.repos = await fetchGitHub(
      `/users/${username}/repos?sort=updated&per_page=5`
    );
  }
  if (include?.includes('starred')) {
    user.starred = await fetchGitHub(
      `/users/${username}/starred?per_page=5`
    );
  }
  
  return user;
}
```

### **Example Usage:**
```bash
# CLI
github-cli user-info --username torvalds --include repos

# Agent
"Show me information about the GitHub user torvalds including their repositories"
```

---

## 🧪 TESTING STRATEGY

### **Phase 1: Unit Tests** (isolated)
Each tool will have a dedicated test function in `cli.ts`:

```bash
# Test individual tools
tsx src/mastra/tools/github/cli.ts search repositories "language:rust stars:>1000" --limit 3
tsx src/mastra/tools/github/cli.ts repo-info facebook react
tsx src/mastra/tools/github/cli.ts issues microsoft vscode --state open --limit 5
tsx src/mastra/tools/github/cli.ts user-info torvalds
```

### **Phase 2: Integration Tests** (with agent)
Register tools and test via chat interface:

```typescript
import { searchTool } from './tools/search';
import { repoInfoTool } from './tools/repo-info';
import { issuesInfoTool } from './tools/issues';
import { userInfoTool } from './tools/user-info';

agent.registerTools([
  searchTool,
  repoInfoTool,
  issuesInfoTool,
  userInfoTool,
]);
```

### **Phase 3: Rate Limit Tests**
- Test with and without authentication
- Verify rate limit headers are logged
- Confirm error handling when rate limit exceeded

---

## 📊 IMPLEMENTATION ORDER

### **Session 1: Schemas + Tool 1 (Search)** — 45min
1. Create `schemas.ts` with all Zod schemas (20min)
2. Implement `tools/search.ts` (15min)
3. Test via CLI (10min)

### **Session 2: Tools 2 & 3 (Repo + Issues)** — 45min
1. Implement `tools/repo-info.ts` (15min)
2. Implement `tools/issues.ts` (15min)
3. Test both via CLI (15min)

### **Session 3: Tool 4 + CLI + Integration** — 45min
1. Implement `tools/user-info.ts` (15min)
2. Create unified CLI (15min)
3. Register all tools in agent (5min)
4. Integration test via chat (10min)

**Total Estimated Time:** ~2-2.5 hours

---

## ✅ SUCCESS CRITERIA

### **Each tool must:**
- [ ] Have complete Zod schemas (input + output)
- [ ] Use `fetchGitHub` client (already tested ✅)
- [ ] Handle errors gracefully (404, rate limits, etc.)
- [ ] Return user-friendly error messages
- [ ] Work without authentication (public API)
- [ ] Be testable via CLI
- [ ] Be registered in Mastra agent
- [ ] Have example usage documented

### **Quality checks:**
- [ ] No TypeScript errors
- [ ] No linter warnings
- [ ] Rate limit logging working
- [ ] Error messages are user-friendly
- [ ] Response times < 2s for single requests
- [ ] CLI has `--help` flag
- [ ] All tools tested with real API calls

---

## 🎯 NEXT STEPS

**If approved:**
1. ✅ Start with `schemas.ts`
2. ✅ Implement Tool 1: Search
3. ✅ Test isolated
4. ✅ Repeat for Tools 2, 3, 4
5. ✅ Create unified CLI
6. ✅ Register in agent
7. ✅ Full integration test

**Estimated completion:** 2-2.5 hours

---

## 🚨 IMPORTANT NOTES

### **Rate Limits:**
- Unauthenticated: 60 req/hour (core), 10 req/min (search)
- Authenticated: 5000 req/hour (core), 30 req/min (search)
- **For testing:** use authenticated requests if available

### **Error Handling:**
All tools use the same error handling from `client.ts`:
- ✅ 404: "Resource not found"
- ✅ 403: "Rate limit exceeded" or "Forbidden"
- ✅ 401: "Invalid token"
- ✅ 500: "GitHub server error"

### **Optional Token:**
All read-only tools accept optional `token` parameter:
- If provided → 5000 req/hour limit
- If not provided → 60 req/hour limit

---

## 📚 REFERENCES

- ✅ GitHub API Documentation: `docs/notes/2025-10-16_github-api-technical-documentation.md`
- ✅ Full Implementation Plan: `docs/notes/2025-10-16_github-tool-implementation-plan.md`
- ✅ System Info Tool (reference pattern): `src/mastra/tools/system-info/`
- ✅ Core client tested: `src/mastra/tools/github/core/` (10/10 tests passed)

---

**Status:** ✅ READY FOR VALIDATION AND IMPLEMENTATION  
**Awaiting:** User approval to proceed with Session 1


