/**
 * GitHub Authentication Helpers
 * Handles token validation and authentication checks
 */

/**
 * Check if GitHub token is provided and throw error if not
 * Used for write operations that require authentication
 * 
 * @param token - GitHub access token (optional)
 * @returns The validated token
 * @throws Error if token is not provided
 */
export function requireAuth(token: string | undefined): string {
  if (!token || token.trim() === '') {
    throw new Error(
      '🔒 GitHub authentication required. Please login with GitHub to use this feature.'
    );
  }
  return token;
}

/**
 * Get optional token for read operations
 * Returns token if available, undefined otherwise
 * 
 * @param token - GitHub access token (optional)
 * @returns Token if provided and valid, undefined otherwise
 */
export function getOptionalToken(token?: string): string | undefined {
  return token && token.trim() !== '' ? token : undefined;
}

/**
 * Validate GitHub token format (basic check)
 * GitHub tokens follow specific patterns:
 * - PAT: ghp_... (40+ chars)
 * - OAuth: gho_... (40+ chars)
 * - GitHub App: ghs_... (40+ chars)
 * 
 * @param token - GitHub access token
 * @returns true if token format is valid
 */
export function isValidTokenFormat(token: string): boolean {
  // GitHub tokens start with gh[ops]_ followed by base62 characters
  return /^gh[opsu]_[A-Za-z0-9]{36,}$/.test(token);
}

/**
 * Mask token for logging (show only first 7 chars)
 * Example: ghp_abc123... -> ghp_abc***
 * 
 * @param token - GitHub access token
 * @returns Masked token string
 */
export function maskToken(token: string): string {
  if (token.length <= 7) return '***';
  return `${token.slice(0, 7)}***`;
}

