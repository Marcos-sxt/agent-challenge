/**
 * GitHub Tools - Zod Schemas
 * Input and output validation for all GitHub tools
 */

import { z } from 'zod';

// ============================================================================
// SEARCH SCHEMAS
// ============================================================================

export const SearchRepositoriesInputSchema = z.object({
  query: z.string().describe(
    'Search query using GitHub syntax (e.g., "language:rust stars:>1000", "user:microsoft", "topic:ai")'
  ),
  sort: z.enum(['stars', 'forks', 'updated']).optional().describe(
    'Sort results by: stars, forks, or updated date'
  ),
  limit: z.number().min(1).max(30).optional().default(5).describe(
    'Maximum number of results to return (1-30, default: 5)'
  ),
});

export const SearchUsersInputSchema = z.object({
  query: z.string().describe(
    'Search query (e.g., "location:brazil followers:>100", "language:typescript")'
  ),
  limit: z.number().min(1).max(30).optional().default(5).describe(
    'Maximum number of results (1-30, default: 5)'
  ),
});

export const SearchCodeInputSchema = z.object({
  query: z.string().describe(
    'Search query (e.g., "fetch language:typescript repo:microsoft/vscode", "class:User")'
  ),
  limit: z.number().min(1).max(30).optional().default(5).describe(
    'Maximum number of results (1-30, default: 5)'
  ),
});

export const SearchInputSchema = z.object({
  type: z.enum(['repositories', 'users', 'code']).describe(
    'Type of search: repositories, users, or code'
  ),
  query: z.string().describe(
    'Search query using GitHub syntax'
  ),
  sort: z.enum(['stars', 'forks', 'updated', 'followers', 'repositories', 'joined']).optional().describe(
    'Sort results (varies by type)'
  ),
  limit: z.number().min(1).max(30).optional().default(5).describe(
    'Maximum number of results (1-30, default: 5)'
  ),
});

// Output schemas
const RepositoryResultSchema = z.object({
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  html_url: z.string(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  language: z.string().nullable(),
  topics: z.array(z.string()).optional(),
  updated_at: z.string(),
  owner: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }),
});

const UserResultSchema = z.object({
  login: z.string(),
  name: z.string().nullable().optional(),
  avatar_url: z.string(),
  html_url: z.string(),
  type: z.string(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  public_repos: z.number().optional(),
  followers: z.number().optional(),
});

const CodeResultSchema = z.object({
  name: z.string(),
  path: z.string(),
  html_url: z.string(),
  repository: z.object({
    name: z.string(),
    full_name: z.string(),
    html_url: z.string(),
  }),
});

export const SearchOutputSchema = z.object({
  type: z.string(),
  total_count: z.number(),
  showing: z.number(),
  results: z.union([
    z.array(RepositoryResultSchema),
    z.array(UserResultSchema),
    z.array(CodeResultSchema),
  ]),
  formatted_message: z.string().describe('Human-readable formatted results'),
});

// ============================================================================
// REPOSITORY INFO SCHEMAS
// ============================================================================

export const GetRepositoryInputSchema = z.object({
  owner: z.string().describe('Repository owner (username or organization)'),
  repo: z.string().describe('Repository name'),
  include: z.array(z.enum(['branches', 'release', 'commits'])).optional().describe(
    'Optional: include additional data (branches, release, commits)'
  ),
});

const BranchSchema = z.object({
  name: z.string(),
  protected: z.boolean(),
  commit: z.object({
    sha: z.string(),
  }).optional(),
});

const ReleaseSchema = z.object({
  tag_name: z.string(),
  name: z.string(),
  published_at: z.string(),
  html_url: z.string(),
  body: z.string().nullable().optional(),
});

const CommitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  author: z.string(),
  date: z.string(),
  html_url: z.string(),
});

export const GetRepositoryOutputSchema = z.object({
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  owner: z.object({
    login: z.string(),
    avatar_url: z.string(),
    type: z.string(),
  }),
  html_url: z.string(),
  homepage: z.string().nullable(),
  language: z.string().nullable(),
  license: z.object({
    name: z.string(),
    key: z.string(),
  }).nullable(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  watchers_count: z.number(),
  default_branch: z.string(),
  topics: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string(),
  size: z.number(),
  
  // Optional extended info
  branches: z.array(BranchSchema).optional(),
  latest_release: ReleaseSchema.nullable().optional(),
  recent_commits: z.array(CommitSchema).optional(),
  
  formatted_message: z.string().describe('Human-readable formatted repository info'),
});

// ============================================================================
// ISSUES SCHEMAS
// ============================================================================

export const ListIssuesInputSchema = z.object({
  owner: z.string().describe('Repository owner'),
  repo: z.string().describe('Repository name'),
  state: z.enum(['open', 'closed', 'all']).optional().default('open').describe(
    'Filter by state: open, closed, or all (default: open)'
  ),
  labels: z.string().optional().describe(
    'Filter by comma-separated labels (e.g., "bug,help-wanted")'
  ),
  limit: z.number().min(1).max(50).optional().default(10).describe(
    'Maximum number of issues (1-50, default: 10)'
  ),
  sort: z.enum(['created', 'updated', 'comments']).optional().default('created').describe(
    'Sort by: created, updated, or comments (default: created)'
  ),
});

const IssueSchema = z.object({
  number: z.number(),
  title: z.string(),
  state: z.string(),
  body: z.string().nullable(),
  user: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }),
  labels: z.array(z.object({
    name: z.string(),
    color: z.string(),
    description: z.string().nullable().optional(),
  })),
  comments: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  html_url: z.string(),
  is_pull_request: z.boolean(),
});

export const ListIssuesOutputSchema = z.object({
  total: z.number(),
  state_filter: z.string(),
  issues: z.array(IssueSchema),
  formatted_message: z.string().describe('Human-readable formatted issues list'),
});

// ============================================================================
// USER INFO SCHEMAS
// ============================================================================

export const GetUserInputSchema = z.object({
  username: z.string().describe('GitHub username'),
  include: z.array(z.enum(['repos', 'starred'])).optional().describe(
    'Optional: include repos or starred repositories'
  ),
});

const UserRepoSchema = z.object({
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  html_url: z.string(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  language: z.string().nullable(),
  updated_at: z.string(),
});

export const GetUserOutputSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  avatar_url: z.string(),
  html_url: z.string(),
  type: z.string(),
  bio: z.string().nullable(),
  company: z.string().nullable(),
  location: z.string().nullable(),
  blog: z.string().nullable(),
  email: z.string().nullable(),
  twitter_username: z.string().nullable(),
  public_repos: z.number(),
  public_gists: z.number(),
  followers: z.number(),
  following: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  
  // Optional extended info
  repos: z.array(UserRepoSchema).optional(),
  starred: z.array(UserRepoSchema).optional(),
  
  formatted_message: z.string().describe('Human-readable formatted user info'),
});

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type SearchInput = z.infer<typeof SearchInputSchema>;
export type SearchOutput = z.infer<typeof SearchOutputSchema>;

export type GetRepositoryInput = z.infer<typeof GetRepositoryInputSchema>;
export type GetRepositoryOutput = z.infer<typeof GetRepositoryOutputSchema>;

export type ListIssuesInput = z.infer<typeof ListIssuesInputSchema>;
export type ListIssuesOutput = z.infer<typeof ListIssuesOutputSchema>;

export type GetUserInput = z.infer<typeof GetUserInputSchema>;
export type GetUserOutput = z.infer<typeof GetUserOutputSchema>;


