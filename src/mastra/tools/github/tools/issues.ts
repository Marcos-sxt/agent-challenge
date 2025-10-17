/**
 * GitHub Issues Tool
 * List and search issues in a GitHub repository
 * 
 * Reference: https://docs.github.com/en/rest/issues/issues
 */

import { createTool } from '@mastra/core/tools';
import { fetchGitHub } from '../core/client';
import { getOptionalToken } from '../core/auth';
import type { GitHubIssue } from '../types';
import { ListIssuesInputSchema, ListIssuesOutputSchema } from '../schemas';

/**
 * Core list issues function
 */
export async function listIssues(
  owner: string,
  repo: string,
  options: {
    state?: 'open' | 'closed' | 'all';
    labels?: string;
    limit?: number;
    sort?: 'created' | 'updated' | 'comments';
    token?: string;
  } = {}
) {
  const {
    state = 'open',
    labels,
    limit = 10,
    sort = 'created',
    token,
  } = options;

  try {
    // Build endpoint
    let endpoint = `/repos/${owner}/${repo}/issues?state=${state}&per_page=${limit}&sort=${sort}&direction=desc`;

    // Add labels filter if provided
    if (labels) {
      endpoint += `&labels=${encodeURIComponent(labels)}`;
    }

    // Fetch issues from GitHub API
    const issues = await fetchGitHub<GitHubIssue[]>(
      endpoint,
      { token: getOptionalToken(token) }
    );

    // Filter out pull requests (GitHub API returns both issues and PRs)
    // Pull requests have a 'pull_request' field
    const onlyIssues = issues.filter(issue => !issue.pull_request);

    // Transform to simpler format
    const transformedIssues = onlyIssues.map(issue => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      body: issue.body,
      user: {
        login: issue.user.login,
        avatar_url: issue.user.avatar_url,
      },
      labels: issue.labels.map(label => ({
        name: label.name,
        color: label.color,
        description: label.description || null,
      })),
      comments: issue.comments,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      html_url: issue.html_url,
      is_pull_request: false, // We already filtered out PRs
    }));

    // Format results for display
    let formatted_message = `# Issues in ${owner}/${repo}\n\n`;
    formatted_message += `Found ${transformedIssues.length} ${state} issue(s)`;
    if (labels && labels.length > 0) {
      formatted_message += ` with labels: ${labels.join(', ')}`;
    }
    formatted_message += `\n\n`;
    
    if (transformedIssues.length === 0) {
      formatted_message += `No issues found matching your criteria.`;
    } else {
      formatted_message += transformedIssues.map((issue, i) => {
        let issueText = `**${i + 1}. #${issue.number}:** ${issue.title}\n`;
        issueText += `   State: ${issue.state} | Comments: ${issue.comments}\n`;
        if (issue.labels && issue.labels.length > 0) {
          issueText += `   Labels: ${issue.labels.map(l => l.name).join(', ')}\n`;
        }
        issueText += `   Created: ${new Date(issue.created_at).toLocaleDateString()} by @${issue.user.login}\n`;
        issueText += `   🔗 ${issue.html_url}`;
        return issueText;
      }).join('\n\n');
    }

    return {
      total: transformedIssues.length,
      state_filter: state,
      issues: transformedIssues,
      formatted_message,
    };
  } catch (error: any) {
    throw new Error(`Failed to list issues: ${error.message}`);
  }
}

/**
 * Mastra Tool: GitHub List Issues
 */
export const githubListIssuesTool = createTool({
  id: 'github-list-issues',
  description: `List issues from a GitHub repository with filtering options.

Filters:
- state: Filter by 'open', 'closed', or 'all' (default: open)
- labels: Filter by comma-separated labels (e.g., "bug,help-wanted")
- sort: Sort by 'created', 'updated', or 'comments' (default: created)
- limit: Maximum number of issues to return (1-50, default: 10)

Returns issue details including:
- Issue number, title, state
- Author information
- Labels with colors
- Comment count
- Creation and update dates
- Direct link to the issue

Note: This tool returns only issues, not pull requests.

Examples:
- "Show me open bugs in microsoft/vscode"
- "List the 20 most recent issues in facebook/react"
- "Find closed issues with label 'security' in nodejs/node"`,
  
  inputSchema: ListIssuesInputSchema,
  outputSchema: ListIssuesOutputSchema,
  
  execute: async ({ context }) => {
    const { owner, repo, state, labels, limit, sort } = context;
    
    return await listIssues(owner, repo, {
      state,
      labels,
      limit,
      sort,
      // Token will be passed from agent context if available
      token: (context as any).githubToken,
    });
  },
});

// Export for direct use
export { listIssues as githubListIssues };


