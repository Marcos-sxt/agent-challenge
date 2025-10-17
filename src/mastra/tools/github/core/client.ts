/**
 * Unified GitHub API Client
 * Handles all HTTP communication with GitHub REST API
 * Features: authentication, rate limits, error handling, retries
 * 
 * Reference: https://docs.github.com/en/rest
 */

import type { GitHubError, GitHubRateLimit } from '../types';

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  token?: string;
  timeout?: number;
}

/**
 * Custom error class for GitHub API errors
 */
export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'GitHubAPIError';
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GitHubAPIError);
    }
  }
}

/**
 * Main function to fetch from GitHub API
 * Handles authentication, rate limits, errors, and timeouts
 * 
 * @param endpoint - API endpoint (e.g., '/users/torvalds' or full URL)
 * @param options - Fetch options (method, body, token, timeout)
 * @returns Parsed JSON response
 * @throws GitHubAPIError for API errors
 */
export async function fetchGitHub<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
    timeout = 10000,
  } = options;

  // Build URL - support both relative and absolute URLs
  const url = endpoint.startsWith('http')
    ? endpoint
    : `https://api.github.com${endpoint}`;

  // Build headers
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Deus-Ex-Machina-Agent/1.0',
  };

  // Add authentication if token provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add content-type for POST/PUT/PATCH
  if (body && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  // Fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Log rate limit info
    logRateLimit(response);

    // Handle errors
    if (!response.ok) {
      await handleAPIError(response);
    }

    // Parse response
    if (response.status === 204) {
      // No content
      return null as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new GitHubAPIError('Request timeout', 408);
    }

    // Re-throw if already GitHubAPIError
    if (error instanceof GitHubAPIError) {
      throw error;
    }

    // Network error
    throw new GitHubAPIError(
      `Network error: ${error.message}`,
      0
    );
  }
}

/**
 * Handle API errors with descriptive messages
 * 
 * @param response - Fetch response object
 * @throws GitHubAPIError with user-friendly message
 */
async function handleAPIError(response: Response): Promise<never> {
  let errorData: GitHubError | undefined;

  try {
    errorData = await response.json();
  } catch {
    // Failed to parse error response
  }

  const status = response.status;
  let message = errorData?.message || response.statusText;

  switch (status) {
    case 400:
      message = `❌ Bad request: ${message}. Please check your parameters.`;
      break;

    case 401:
      message = '🔒 Invalid GitHub token. Please re-authenticate.';
      break;

    case 403:
      const remaining = response.headers.get('X-RateLimit-Remaining');
      if (remaining === '0') {
        const reset = response.headers.get('X-RateLimit-Reset');
        const resetDate = reset
          ? new Date(parseInt(reset) * 1000).toLocaleTimeString()
          : 'soon';
        message = `⏱️ GitHub rate limit exceeded. Resets at ${resetDate}. Try authenticating for higher limits.`;
      } else {
        message = '🚫 GitHub API forbidden. Check your permissions or token scopes.';
      }
      break;

    case 404:
      message = '🔍 Resource not found on GitHub. Check owner/repo names.';
      break;

    case 422:
      message = `❌ Validation failed: ${message}`;
      if (errorData?.errors && errorData.errors.length > 0) {
        const errorDetails = errorData.errors
          .map(e => `${e.field}: ${e.message || e.code}`)
          .join(', ');
        message += ` (${errorDetails})`;
      }
      break;

    case 500:
    case 502:
    case 503:
      message = '🔧 GitHub server error. Please try again later.';
      break;
  }

  throw new GitHubAPIError(message, status, errorData);
}

/**
 * Log rate limit information from response headers
 * Warns if rate limit is low
 * 
 * @param response - Fetch response object
 */
function logRateLimit(response: Response): void {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  if (limit && remaining && reset) {
    const resetDate = new Date(parseInt(reset) * 1000);
    const now = new Date();
    const minutesUntilReset = Math.ceil(
      (resetDate.getTime() - now.getTime()) / 1000 / 60
    );

    console.log(
      `[GitHub API] Rate Limit: ${remaining}/${limit} remaining (resets in ${minutesUntilReset}m)`
    );

    // Warn if low
    if (parseInt(remaining) < 10) {
      console.warn(
        `⚠️ GitHub rate limit low: ${remaining} requests remaining!`
      );
    }
  }
}

/**
 * Get current rate limit status
 * 
 * @param token - GitHub access token (optional)
 * @returns Rate limit information
 */
export async function getRateLimit(token?: string): Promise<GitHubRateLimit> {
  const response = await fetchGitHub<{ resources: { core: GitHubRateLimit } }>(
    '/rate_limit',
    { token }
  );
  return response.resources.core;
}

/**
 * Fetch with retry logic for transient errors
 * Implements exponential backoff
 * 
 * @param endpoint - API endpoint
 * @param options - Fetch options
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns API response
 */
export async function fetchWithRetry<T>(
  endpoint: string,
  options: FetchOptions = {},
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchGitHub<T>(endpoint, options);
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (4xx except 429)
      if (error instanceof GitHubAPIError) {
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, ...
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`[GitHub API] Retry ${attempt}/${maxRetries} after ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Helper function to sleep for a given duration
 * 
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

