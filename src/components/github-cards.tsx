/**
 * GitHub Tools - UI Card Components
 * Visual components for displaying GitHub tool results
 */

import { SearchOutput, GetRepositoryOutput, ListIssuesOutput, GetUserOutput } from '@/mastra/tools/github/types-export';

// ============================================================================
// GITHUB SEARCH CARD
// ============================================================================

export function GitHubSearchCard({
  themeColor,
  result,
  status,
}: {
  themeColor: string;
  result: SearchOutput;
  status: "inProgress" | "executing" | "complete";
}) {
  if (status !== "complete" || !result) {
    return (
      <div
        className="rounded-xl shadow-xl mt-6 mb-4 max-w-2xl w-full"
        style={{ backgroundColor: themeColor }}
      >
        <div className="bg-white/20 p-4 w-full">
          <p className="text-white animate-pulse">🔍 Searching GitHub...</p>
        </div>
      </div>
    );
  }

  const { type, total_count, showing, results } = result;

  // Additional safety check for data integrity
  if (!type || !results || !Array.isArray(results)) {
    return (
      <div
        className="rounded-xl shadow-xl mt-6 mb-4 max-w-2xl w-full"
        style={{ backgroundColor: themeColor }}
      >
        <div className="bg-white/20 p-4 w-full">
          <p className="text-white">⚠️ No results available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="rounded-xl shadow-xl mt-6 mb-4 max-w-2xl w-full"
    >
      <div className="bg-white/20 p-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white capitalize">
              {type === 'repositories' && '📦 Repositories'}
              {type === 'users' && '👤 Users'}
              {type === 'code' && '💻 Code'}
            </h3>
            <p className="text-white/80 text-sm">
              Found {(total_count || 0).toLocaleString()} result{total_count !== 1 ? 's' : ''} · Showing {showing || 0}
            </p>
          </div>
          <div className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {type === 'repositories' && results.map((repo: any, i: number) => (
            <div key={i} className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <a
                    href={repo.html_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-semibold hover:underline text-lg"
                  >
                    {repo.full_name || 'Unknown repo'}
                  </a>
                  <p className="text-white/80 text-sm mt-1">
                    {repo.description || 'No description'}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-white/70">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-white/30"></span>
                        {repo.language}
                      </span>
                    )}
                    <span>⭐ {(repo.stargazers_count || 0).toLocaleString()}</span>
                    <span>🍴 {(repo.forks_count || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {type === 'users' && results.map((user: any, i: number) => (
            <div key={i} className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url || ''}
                  alt={user.login || 'user'}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <a
                    href={user.html_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-semibold hover:underline"
                  >
                    @{user.login || 'unknown'}
                  </a>
                  {user.name && <p className="text-white/80 text-sm">{user.name}</p>}
                  {user.bio && <p className="text-white/70 text-xs mt-1">{user.bio}</p>}
                  <div className="flex gap-3 mt-2 text-xs text-white/70">
                    {user.public_repos !== undefined && <span>📦 {user.public_repos} repos</span>}
                    {user.followers !== undefined && <span>👥 {(user.followers || 0).toLocaleString()} followers</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {type === 'code' && results.map((code: any, i: number) => (
            <div key={i} className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors">
              <div className="flex flex-col gap-2">
                <a
                  href={code.html_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-semibold hover:underline font-mono text-sm"
                >
                  {code.path || 'Unknown path'}
                </a>
                {code.repository && (
                  <a
                    href={code.repository.html_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 text-xs hover:underline"
                  >
                    📦 {code.repository.full_name || 'Unknown repo'}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GITHUB REPO INFO CARD
// ============================================================================

export function GitHubRepoCard({
  themeColor,
  result,
  status,
}: {
  themeColor: string;
  result: GetRepositoryOutput;
  status: "inProgress" | "executing" | "complete";
}) {
  if (status !== "complete" || !result) {
    return (
      <div
        className="rounded-xl shadow-xl mt-6 mb-4 max-w-2xl w-full"
        style={{ backgroundColor: themeColor }}
      >
        <div className="bg-white/20 p-4 w-full">
          <p className="text-white animate-pulse">📦 Loading repository info...</p>
        </div>
      </div>
    );
  }

  // Additional safety check for data integrity
  if (!result.full_name || !result.owner) {
    return (
      <div
        style={{ backgroundColor: themeColor }}
        className="rounded-xl shadow-xl mt-6 mb-4 max-w-2xl w-full"
      >
        <div className="bg-white/20 p-6 w-full">
          <p className="text-white">⚠️ No repository data available</p>
          {(result as any).message && (
            <p className="text-white/70 text-sm mt-2">{(result as any).message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="rounded-xl shadow-xl mt-6 mb-4 max-w-2xl w-full"
    >
      <div className="bg-white/20 p-6 w-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <a
              href={result.html_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-bold text-white hover:underline"
            >
              {result.full_name}
            </a>
            <p className="text-white/80 mt-2">{result.description || 'No description'}</p>
          </div>
          {result.owner && (
            <img
              src={result.owner.avatar_url || ''}
              alt={result.owner.login || 'owner'}
              className="w-16 h-16 rounded-lg ml-4"
            />
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 my-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-white/70 text-xs">Stars</p>
            <p className="text-white font-bold text-lg">⭐ {(result.stargazers_count || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-white/70 text-xs">Forks</p>
            <p className="text-white font-bold text-lg">🍴 {(result.forks_count || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-white/70 text-xs">Issues</p>
            <p className="text-white font-bold text-lg">🐛 {(result.open_issues_count || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-white/70 text-xs">Watchers</p>
            <p className="text-white font-bold text-lg">👀 {(result.watchers_count || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Meta info */}
        <div className="space-y-2 text-sm">
          {result.language && (
            <div className="flex items-center gap-2 text-white/80">
              <span className="w-3 h-3 rounded-full bg-white/30"></span>
              <span>Language: {result.language}</span>
            </div>
          )}
          {result.license && result.license.name && (
            <div className="flex items-center gap-2 text-white/80">
              <span>⚖️</span>
              <span>License: {result.license.name}</span>
            </div>
          )}
          {result.homepage && (
            <div className="flex items-center gap-2 text-white/80">
              <span>🔗</span>
              <a href={result.homepage} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                {result.homepage}
              </a>
            </div>
          )}
        </div>

        {/* Topics */}
        {result.topics && result.topics.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {result.topics.map((topic, i) => (
                <span
                  key={i}
                  className="bg-white/20 text-white text-xs px-3 py-1 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Latest Release */}
        {result.latest_release && result.latest_release.tag_name && (
          <div className="mt-4 bg-white/10 rounded-lg p-3">
            <p className="text-white font-semibold text-sm mb-1">📦 Latest Release</p>
            <a
              href={result.latest_release.html_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:underline text-sm"
            >
              {result.latest_release.tag_name} {result.latest_release.name && `- ${result.latest_release.name}`}
            </a>
            {result.latest_release.published_at && (
              <p className="text-white/70 text-xs mt-1">
                {new Date(result.latest_release.published_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Recent Commits */}
        {result.recent_commits && result.recent_commits.length > 0 && (
          <div className="mt-4 bg-white/10 rounded-lg p-3">
            <p className="text-white font-semibold text-sm mb-2">📝 Recent Commits</p>
            <div className="space-y-2">
              {result.recent_commits.map((commit, i) => (
                <div key={i} className="text-xs">
                  <a
                    href={commit.html_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/90 hover:underline font-mono"
                  >
                    {commit.sha ? commit.sha.substring(0, 7) : 'unknown'}
                  </a>
                  <span className="text-white/70"> - {commit.message ? commit.message.split('\n')[0] : 'No message'}</span>
                  <p className="text-white/60 mt-1">
                    by {commit.author || 'unknown'} · {commit.date ? new Date(commit.date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// GITHUB ISSUES CARD
// ============================================================================

export function GitHubIssuesCard({
  themeColor,
  result,
  status,
}: {
  themeColor: string;
  result: ListIssuesOutput;
  status: "inProgress" | "executing" | "complete";
}) {
  if (status !== "complete" || !result) {
    return (
      <div
        className="rounded-xl shadow-xl mt-6 mb-4 max-w-2xl w-full"
        style={{ backgroundColor: themeColor }}
      >
        <div className="bg-white/20 p-4 w-full">
          <p className="text-white animate-pulse">🐛 Loading issues...</p>
        </div>
      </div>
    );
  }

  // Additional safety check for data integrity
  if (!result.issues || !Array.isArray(result.issues)) {
    return (
      <div
        style={{ backgroundColor: themeColor }}
        className="rounded-xl shadow-xl mt-6 mb-4 max-w-2xl w-full"
      >
        <div className="bg-white/20 p-6 w-full">
          <p className="text-white">⚠️ No issues data available</p>
          {(result as any).message && (
            <p className="text-white/70 text-sm mt-2">{(result as any).message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="rounded-xl shadow-xl mt-6 mb-4 max-w-2xl w-full"
    >
      <div className="bg-white/20 p-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">🐛 Issues</h3>
            <p className="text-white/80 text-sm">
              {(result.total || 0)} {result.state_filter || 'open'} issue{(result.total || 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-3">
          {result.issues.map((issue) => (
            <div key={issue.number} className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {issue.is_pull_request ? (
                    <span className="text-2xl">🔀</span>
                  ) : (
                    <span className="text-2xl">
                      {issue.state === 'open' ? '🟢' : '🔴'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-semibold hover:underline"
                  >
                    #{issue.number} {issue.title}
                  </a>
                  
                  {/* Labels */}
                  {issue.labels && issue.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {issue.labels.map((label, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `#${label.color || 'cccccc'}`,
                            color: parseInt(label.color || 'cccccc', 16) > 0xffffff / 2 ? '#000' : '#fff',
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Meta */}
                  <div className="flex gap-3 mt-2 text-xs text-white/70">
                    {issue.user && (
                      <span className="flex items-center gap-1">
                        <img
                          src={issue.user.avatar_url || ''}
                          alt={issue.user.login || 'user'}
                          className="w-4 h-4 rounded-full"
                        />
                        @{issue.user.login || 'unknown'}
                      </span>
                    )}
                    <span>💬 {issue.comments || 0}</span>
                    {issue.created_at && (
                      <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GITHUB USER CARD
// ============================================================================

export function GitHubUserCard({
  themeColor,
  result,
  status,
}: {
  themeColor: string;
  result: GetUserOutput;
  status: "inProgress" | "executing" | "complete";
}) {
  if (status !== "complete" || !result) {
    return (
      <div
        className="rounded-xl shadow-xl mt-6 mb-4 max-w-2xl w-full"
        style={{ backgroundColor: themeColor }}
      >
        <div className="bg-white/20 p-4 w-full">
          <p className="text-white animate-pulse">👤 Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Additional safety check for data integrity
  if (!result.login) {
    return (
      <div
        style={{ backgroundColor: themeColor }}
        className="rounded-xl shadow-xl mt-6 mb-4 max-w-2xl w-full"
      >
        <div className="bg-white/20 p-6 w-full">
          <p className="text-white">⚠️ No user data available</p>
          {(result as any).message && (
            <p className="text-white/70 text-sm mt-2">{(result as any).message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="rounded-xl shadow-xl mt-6 mb-4 max-w-2xl w-full"
    >
      <div className="bg-white/20 p-6 w-full">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <img
            src={result.avatar_url || ''}
            alt={result.login || 'user'}
            className="w-24 h-24 rounded-lg"
          />
          <div className="flex-1">
            <a
              href={result.html_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-bold text-white hover:underline"
            >
              {result.name || result.login}
            </a>
            <p className="text-white/80">@{result.login}</p>
            {result.bio && (
              <p className="text-white/90 mt-2 text-sm">{result.bio}</p>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="space-y-2 text-sm mb-4">
          {result.company && (
            <div className="flex items-center gap-2 text-white/80">
              <span>🏢</span>
              <span>{result.company}</span>
            </div>
          )}
          {result.location && (
            <div className="flex items-center gap-2 text-white/80">
              <span>📍</span>
              <span>{result.location}</span>
            </div>
          )}
          {result.blog && (
            <div className="flex items-center gap-2 text-white/80">
              <span>🔗</span>
              <a href={result.blog} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                {result.blog}
              </a>
            </div>
          )}
          {result.twitter_username && (
            <div className="flex items-center gap-2 text-white/80">
              <span>🐦</span>
              <a
                href={`https://twitter.com/${result.twitter_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                @{result.twitter_username}
              </a>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 my-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-white/70 text-xs">Repos</p>
            <p className="text-white font-bold text-lg">📦 {(result.public_repos || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-white/70 text-xs">Gists</p>
            <p className="text-white font-bold text-lg">📝 {(result.public_gists || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-white/70 text-xs">Followers</p>
            <p className="text-white font-bold text-lg">👥 {(result.followers || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-white/70 text-xs">Following</p>
            <p className="text-white font-bold text-lg">➡️ {(result.following || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* User Repos */}
        {result.repos && result.repos.length > 0 && (
          <div className="mt-4">
            <p className="text-white font-semibold mb-2">📦 Top Repositories</p>
            <div className="space-y-2">
              {result.repos.map((repo, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors">
                  <a
                    href={repo.html_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-semibold hover:underline text-sm"
                  >
                    {repo.full_name || 'Unknown repo'}
                  </a>
                  <p className="text-white/70 text-xs mt-1">
                    {repo.description || 'No description'}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-white/60">
                    {repo.language && <span>{repo.language}</span>}
                    <span>⭐ {(repo.stargazers_count || 0).toLocaleString()}</span>
                    <span>🍴 {(repo.forks_count || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Starred Repos */}
        {result.starred && result.starred.length > 0 && (
          <div className="mt-4">
            <p className="text-white font-semibold mb-2">⭐ Recently Starred</p>
            <div className="space-y-2">
              {result.starred.map((repo, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors">
                  <a
                    href={repo.html_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-semibold hover:underline text-sm"
                  >
                    {repo.full_name || 'Unknown repo'}
                  </a>
                  <p className="text-white/70 text-xs mt-1">
                    {repo.description || 'No description'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Member since */}
        <p className="text-white/60 text-xs mt-4">
          Member since {new Date(result.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

