/**
 * GitHub User Info Tool
 * Get detailed information about a GitHub user
 * 
 * Reference: https://docs.github.com/en/rest/users/users
 */

import { createTool } from '@mastra/core/tools';
import { fetchGitHub } from '../core/client';
import { getOptionalToken } from '../core/auth';
import type { GitHubUser, GitHubRepository } from '../types';
import { GetUserInputSchema, GetUserOutputSchema } from '../schemas';

/**
 * Core user info function
 */
export async function getUserInfo(
  username: string,
  options: {
    include?: string[];
    token?: string;
  } = {}
) {
  const { include = [], token } = options;

  try {
    // Fetch user data
    const userData = await fetchGitHub<GitHubUser>(
      `/users/${username}`,
      { token: getOptionalToken(token) }
    );

    // Build base response
    const response: any = {
      login: userData.login,
      name: userData.name,
      avatar_url: userData.avatar_url,
      html_url: userData.html_url,
      type: userData.type,
      bio: userData.bio,
      company: userData.company,
      location: userData.location,
      blog: userData.blog,
      email: userData.email,
      twitter_username: userData.twitter_username || null,
      public_repos: userData.public_repos,
      public_gists: userData.public_gists || 0,
      followers: userData.followers,
      following: userData.following,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };

    // Fetch optional data
    if (include.includes('repos')) {
      try {
        const repos = await fetchGitHub<GitHubRepository[]>(
          `/users/${username}/repos?sort=updated&per_page=5`,
          { token: getOptionalToken(token) }
        );
        response.repos = repos.map(repo => ({
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          language: repo.language,
          updated_at: repo.updated_at,
        }));
      } catch (error: any) {
        console.warn('Failed to fetch repos:', error.message);
        response.repos = [];
      }
    }

    if (include.includes('starred')) {
      try {
        const starred = await fetchGitHub<GitHubRepository[]>(
          `/users/${username}/starred?per_page=5`,
          { token: getOptionalToken(token) }
        );
        response.starred = starred.map(repo => ({
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          language: repo.language,
          updated_at: repo.updated_at,
        }));
      } catch (error: any) {
        console.warn('Failed to fetch starred repos:', error.message);
        response.starred = [];
      }
    }

    // Format results for display
    let formatted_message = `# ${response.name || response.login}\n`;
    formatted_message += `@${response.login}`;
    if (response.type === 'Organization') {
      formatted_message += ` (Organization)`;
    }
    formatted_message += `\n\n`;
    
    if (response.bio) {
      formatted_message += `${response.bio}\n\n`;
    }
    
    formatted_message += `**Stats:**\n`;
    formatted_message += `- 📦 ${response.public_repos} public repositories\n`;
    formatted_message += `- 👥 ${response.followers.toLocaleString()} followers\n`;
    formatted_message += `- 👤 ${response.following.toLocaleString()} following\n`;
    formatted_message += `- 📜 ${response.public_gists} public gists\n`;
    
    if (response.company) {
      formatted_message += `\n**Company:** ${response.company}\n`;
    }
    if (response.location) {
      formatted_message += `**Location:** ${response.location}\n`;
    }
    if (response.blog) {
      formatted_message += `**Blog:** ${response.blog}\n`;
    }
    if (response.email) {
      formatted_message += `**Email:** ${response.email}\n`;
    }
    if (response.twitter_username) {
      formatted_message += `**Twitter:** @${response.twitter_username}\n`;
    }
    
    if (response.repos && response.repos.length > 0) {
      formatted_message += `\n**Recent Repositories:**\n`;
      formatted_message += response.repos.map((repo: any) => 
        `- **${repo.name}** (${repo.stargazers_count} ⭐): ${repo.description || 'No description'}`
      ).join('\n');
    }
    
    if (response.starred && response.starred.length > 0) {
      formatted_message += `\n\n**Recently Starred:**\n`;
      formatted_message += response.starred.map((repo: any) => 
        `- **${repo.full_name}** (${repo.stargazers_count} ⭐)`
      ).join('\n');
    }
    
    formatted_message += `\n\n🔗 ${response.html_url}`;

    return {
      ...response,
      formatted_message,
    };
  } catch (error: any) {
    throw new Error(`Failed to get user info: ${error.message}`);
  }
}

/**
 * Mastra Tool: GitHub User Info
 */
export const githubUserInfoTool = createTool({
  id: 'github-user-info',
  description: `Get detailed information about a GitHub user or organization.

Provides:
- Username, display name, avatar
- Profile URL
- Bio, company, location, blog
- Email and Twitter (if public)
- Statistics: public repos, gists, followers, following
- Account creation and last update dates

Optional extended data (use 'include' parameter):
- 'repos': User's repositories (5 most recently updated)
- 'starred': Repositories starred by user (5 most recent)

Works for both individual users and organizations.

Examples:
- "Show me information about the GitHub user torvalds"
- "Get profile details for microsoft including their repositories"
- "Find info about octocat with their starred projects"`,
  
  inputSchema: GetUserInputSchema,
  outputSchema: GetUserOutputSchema,
  
  execute: async ({ context }) => {
    const { username, include } = context;
    
    return await getUserInfo(username, {
      include,
      // Token will be passed from agent context if available
      token: (context as any).githubToken,
    });
  },
});

// Export for direct use
export { getUserInfo as githubUserInfo };


