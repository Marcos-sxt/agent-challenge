/**
 * GitHub API Type Definitions
 * Based on GitHub REST API v3
 * Reference: https://docs.github.com/en/rest
 */

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    type?: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  topics?: string[];
  visibility?: string;
  license: {
    key: string;
    name: string;
    url?: string;
  } | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  state: string;
  title: string;
  body: string | null;
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description?: string;
  }>;
  assignees?: Array<{
    login: string;
    id: number;
  }>;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  pull_request?: {
    url: string;
  };
}

export interface GitHubPullRequest extends Omit<GitHubIssue, 'pull_request'> {
  merged_at: string | null;
  draft: boolean;
  head: {
    ref: string;
    sha: string;
    label?: string;
  };
  base: {
    ref: string;
    sha: string;
    label?: string;
  };
  mergeable?: boolean;
  mergeable_state?: string;
  merged?: boolean;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  gravatar_id?: string;
  url: string;
  html_url: string;
  type: string;
  site_admin?: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username?: string | null;
  public_repos: number;
  public_gists?: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer?: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree?: {
      sha: string;
      url: string;
    };
    comment_count?: number;
  };
  url: string;
  html_url: string;
  author: {
    login: string;
    id: number;
    avatar_url: string;
  } | null;
  committer?: {
    login: string;
    id: number;
    avatar_url: string;
  } | null;
  parents?: Array<{
    sha: string;
    url: string;
  }>;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  html_url: string;
  assets: Array<{
    id: number;
    name: string;
    size: number;
    download_count: number;
    browser_download_url: string;
  }>;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  download_url: string | null;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  content?: string;
  encoding?: string;
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export interface GitHubError {
  message: string;
  documentation_url?: string;
  status?: string;
  errors?: Array<{
    resource?: string;
    field?: string;
    code?: string;
    message?: string;
  }>;
}

export interface GitHubSearchResponse<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

