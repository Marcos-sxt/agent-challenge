/**
 * GitHub Tools - Main Export
 * Export all GitHub tools for easy registration in Mastra agent
 */

// Export all tools
export { githubSearchTool } from './tools/search';
export { githubRepoInfoTool } from './tools/repo-info';
export { githubListIssuesTool } from './tools/issues';
export { githubUserInfoTool } from './tools/user-info';

// Export core functions for direct use
export { githubSearch } from './tools/search';
export { githubRepoInfo } from './tools/repo-info';
export { githubListIssues } from './tools/issues';
export { githubUserInfo } from './tools/user-info';

// Export types
export type {
  SearchInput,
  SearchOutput,
  GetRepositoryInput,
  GetRepositoryOutput,
  ListIssuesInput,
  ListIssuesOutput,
  GetUserInput,
  GetUserOutput,
} from './schemas';

// Export all tools as array for easy registration
import { githubSearchTool } from './tools/search';
import { githubRepoInfoTool } from './tools/repo-info';
import { githubListIssuesTool } from './tools/issues';
import { githubUserInfoTool } from './tools/user-info';

export const githubTools = [
  githubSearchTool,
  githubRepoInfoTool,
  githubListIssuesTool,
  githubUserInfoTool,
];

export default githubTools;


