/**
 * GitHub Search Tool
 * Search for repositories, users, or code on GitHub
 * 
 * Reference: https://docs.github.com/en/rest/search
 */

import { createTool } from '@mastra/core/tools';
import { fetchGitHub } from '../core/client';
import { getOptionalToken } from '../core/auth';
import type { GitHubSearchResponse } from '../types';
import { SearchInputSchema, SearchOutputSchema } from '../schemas';

/**
 * Core search function
 */
export async function search(
  type: 'repositories' | 'users' | 'code',
  query: string,
  options: {
    sort?: string;
    limit?: number;
    token?: string;
  } = {}
) {
  const { sort, limit = 5, token } = options;

  // Build endpoint
  let endpoint = `/search/${type}?q=${encodeURIComponent(query)}&per_page=${limit}`;

  // Add sort if provided and valid for this search type
  if (sort) {
    endpoint += `&sort=${sort}`;
    endpoint += '&order=desc'; // Always descending for best results first
  }

  try {
    // Fetch from GitHub API
    const response = await fetchGitHub<GitHubSearchResponse<any>>(
      endpoint,
      { token: getOptionalToken(token) }
    );

    // Transform results based on type
    let results;
    switch (type) {
      case 'repositories':
        results = response.items.map((repo: any) => ({
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          language: repo.language,
          topics: repo.topics || [],
          updated_at: repo.updated_at,
          owner: {
            login: repo.owner.login,
            avatar_url: repo.owner.avatar_url,
          },
        }));
        break;

      case 'users':
        results = response.items.map((user: any) => ({
          login: user.login,
          name: user.name || null,
          avatar_url: user.avatar_url,
          html_url: user.html_url,
          type: user.type,
          bio: user.bio || null,
          location: user.location || null,
          public_repos: user.public_repos,
          followers: user.followers,
        }));
        break;

      case 'code':
        results = response.items.map((code: any) => ({
          name: code.name,
          path: code.path,
          html_url: code.html_url,
          repository: {
            name: code.repository.name,
            full_name: code.repository.full_name,
            html_url: code.repository.html_url,
          },
        }));
        break;

      default:
        throw new Error(`Invalid search type: ${type}`);
    }

    // Format results for display
    let formatted_message = '';
    
    if (type === 'repositories') {
      formatted_message = `Found ${response.total_count.toLocaleString()} repositories matching your search! Here are the top ${results.length}:\n\n`;
      formatted_message += results.map((repo: any, i: number) => 
        `${i + 1}. **${repo.full_name}** (${repo.stargazers_count.toLocaleString()} ⭐)\n` +
        `   ${repo.description || 'No description'}\n` +
        `   Language: ${repo.language || 'N/A'} | Forks: ${repo.forks_count.toLocaleString()}\n` +
        `   🔗 ${repo.html_url}`
      ).join('\n\n');
    } else if (type === 'users') {
      formatted_message = `Found ${response.total_count.toLocaleString()} users matching your search! Here are the top ${results.length}:\n\n`;
      formatted_message += results.map((user: any, i: number) => 
        `${i + 1}. **${user.login}** ${user.name ? `(${user.name})` : ''}\n` +
        `   ${user.bio || 'No bio'}\n` +
        `   Location: ${user.location || 'N/A'} | Repos: ${user.public_repos || 0} | Followers: ${user.followers || 0}\n` +
        `   🔗 ${user.html_url}`
      ).join('\n\n');
    } else if (type === 'code') {
      formatted_message = `Found ${response.total_count.toLocaleString()} code files matching your search! Here are the top ${results.length}:\n\n`;
      formatted_message += results.map((code: any, i: number) => 
        `${i + 1}. **${code.name}** in ${code.repository.full_name}\n` +
        `   Path: ${code.path}\n` +
        `   🔗 ${code.html_url}`
      ).join('\n\n');
    }

    return {
      type,
      total_count: response.total_count,
      showing: results.length,
      results,
      formatted_message,
    };
  } catch (error: any) {
    // Add context to error
    throw new Error(`GitHub search failed: ${error.message}`);
  }
}

/**
 * Mastra Tool: GitHub Search
 */
export const githubSearchTool = createTool({
  id: 'github-search',
  description: `Search GitHub for repositories, users, or code. 

CRITICAL: Use single comparison operators only: stars:>5000 (CORRECT) NOT stars:>>5000 (WRONG)

Examples:
- Repositories: "language:rust stars:>1000" to find popular Rust projects
- Users: "location:brazil followers:>100" to find Brazilian developers  
- Code: "fetch language:typescript repo:microsoft/vscode" to find code in specific repos

Search supports GitHub's advanced syntax including filters for language, stars, forks, topics, and more.

Note: Search API has lower rate limits (10 req/min unauthenticated, 30 req/min authenticated).`,
  
  inputSchema: SearchInputSchema,
  outputSchema: SearchOutputSchema,
  
  execute: async ({ context }) => {
    const { type, query, sort, limit } = context;
    
    return await search(type, query, {
      sort,
      limit,
      // Token will be passed from agent context if available
      token: (context as any).githubToken,
    });
  },
});

// Export for direct use
export { search as githubSearch };


