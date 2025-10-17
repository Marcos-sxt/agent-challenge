/**
 * GitHub Repository Info Tool
 * Get detailed information about a GitHub repository
 * 
 * Reference: https://docs.github.com/en/rest/repos/repos
 */

import { createTool } from '@mastra/core/tools';
import { fetchGitHub } from '../core/client';
import { getOptionalToken } from '../core/auth';
import type { GitHubRepository, GitHubBranch, GitHubRelease, GitHubCommit } from '../types';
import { GetRepositoryInputSchema, GetRepositoryOutputSchema } from '../schemas';

/**
 * Core repository info function
 */
export async function getRepositoryInfo(
  owner: string,
  repo: string,
  options: {
    include?: string[];
    token?: string;
  } = {}
) {
  const { include = [], token } = options;

  try {
    // Fetch main repository data
    const repoData = await fetchGitHub<GitHubRepository>(
      `/repos/${owner}/${repo}`,
      { token: getOptionalToken(token) }
    );

    // Build base response
    const response: any = {
      name: repoData.name,
      full_name: repoData.full_name,
      description: repoData.description,
      owner: {
        login: repoData.owner.login,
        avatar_url: repoData.owner.avatar_url,
        type: repoData.owner.type || 'User',
      },
      html_url: repoData.html_url,
      homepage: repoData.homepage,
      language: repoData.language,
      license: repoData.license ? {
        name: repoData.license.name,
        key: repoData.license.key,
      } : null,
      stargazers_count: repoData.stargazers_count,
      forks_count: repoData.forks_count,
      open_issues_count: repoData.open_issues_count,
      watchers_count: repoData.watchers_count,
      default_branch: repoData.default_branch,
      topics: repoData.topics || [],
      created_at: repoData.created_at,
      updated_at: repoData.updated_at,
      pushed_at: repoData.pushed_at,
      size: repoData.size,
    };

    // Fetch optional data
    if (include.includes('branches')) {
      try {
        const branches = await fetchGitHub<GitHubBranch[]>(
          `/repos/${owner}/${repo}/branches?per_page=10`,
          { token: getOptionalToken(token) }
        );
        response.branches = branches.map(b => ({
          name: b.name,
          protected: b.protected,
          commit: { sha: b.commit.sha },
        }));
      } catch (error: any) {
        console.warn('Failed to fetch branches:', error.message);
        response.branches = [];
      }
    }

    if (include.includes('release')) {
      try {
        const release = await fetchGitHub<GitHubRelease>(
          `/repos/${owner}/${repo}/releases/latest`,
          { token: getOptionalToken(token) }
        );
        response.latest_release = {
          tag_name: release.tag_name,
          name: release.name,
          published_at: release.published_at,
          html_url: release.html_url,
          body: release.body,
        };
      } catch (error: any) {
        // No release found is not an error
        console.warn('No release found or failed to fetch:', error.message);
        response.latest_release = null;
      }
    }

    if (include.includes('commits')) {
      try {
        const commits = await fetchGitHub<GitHubCommit[]>(
          `/repos/${owner}/${repo}/commits?per_page=5`,
          { token: getOptionalToken(token) }
        );
        response.recent_commits = commits.map(c => ({
          sha: c.sha.substring(0, 7), // Short SHA
          message: c.commit.message.split('\n')[0], // First line only
          author: c.commit.author.name,
          date: c.commit.author.date,
          html_url: c.html_url,
        }));
      } catch (error: any) {
        console.warn('Failed to fetch commits:', error.message);
        response.recent_commits = [];
      }
    }

    // Format results for display
    let formatted_message = `# ${response.full_name}\n\n`;
    formatted_message += `${response.description || 'No description provided'}\n\n`;
    formatted_message += `**Stats:**\n`;
    formatted_message += `- ⭐ ${response.stargazers_count.toLocaleString()} stars\n`;
    formatted_message += `- 🍴 ${response.forks_count.toLocaleString()} forks\n`;
    formatted_message += `- 👀 ${response.watchers_count.toLocaleString()} watchers\n`;
    formatted_message += `- 🐛 ${response.open_issues_count.toLocaleString()} open issues\n`;
    formatted_message += `- 📝 Language: ${response.language || 'N/A'}\n`;
    formatted_message += `- 📜 License: ${response.license?.name || 'None'}\n`;
    
    if (response.homepage) {
      formatted_message += `\n**Homepage:** ${response.homepage}\n`;
    }
    
    if (response.topics && response.topics.length > 0) {
      formatted_message += `\n**Topics:** ${response.topics.join(', ')}\n`;
    }
    
    if (response.branches && response.branches.length > 0) {
      formatted_message += `\n**Branches:** ${response.branches.map(b => b.name).join(', ')}\n`;
    }
    
    if (response.latest_release) {
      formatted_message += `\n**Latest Release:** ${response.latest_release.tag_name} - ${response.latest_release.name}\n`;
      formatted_message += `Published: ${new Date(response.latest_release.published_at).toLocaleDateString()}\n`;
    }
    
    if (response.recent_commits && response.recent_commits.length > 0) {
      formatted_message += `\n**Recent Commits:**\n`;
      formatted_message += response.recent_commits.map(c => 
        `- ${c.sha}: ${c.message} (${c.author}, ${new Date(c.date).toLocaleDateString()})`
      ).join('\n');
    }
    
    formatted_message += `\n\n🔗 ${response.html_url}`;
    
    return {
      ...response,
      formatted_message,
    };
  } catch (error: any) {
    throw new Error(`Failed to get repository info: ${error.message}`);
  }
}

/**
 * Mastra Tool: GitHub Repository Info
 */
export const githubRepoInfoTool = createTool({
  id: 'github-repo-info',
  description: `Get detailed information about a GitHub repository including stats, metadata, and optional extended data.

Provides:
- Repository name, description, homepage
- Owner information
- Stars, forks, watchers, open issues counts
- Language, license, topics
- Creation and update dates
- Repository size

Optional extended data (use 'include' parameter):
- 'branches': List of repository branches (up to 10)
- 'release': Latest release information
- 'commits': Recent commits (last 5)

Example: "Show me details about facebook/react including branches and latest release"`,
  
  inputSchema: GetRepositoryInputSchema,
  outputSchema: GetRepositoryOutputSchema,
  
  execute: async ({ context }) => {
    const { owner, repo, include } = context;
    
    return await getRepositoryInfo(owner, repo, {
      include,
      // Token will be passed from agent context if available
      token: (context as any).githubToken,
    });
  },
});

// Export for direct use
export { getRepositoryInfo as githubRepoInfo };


