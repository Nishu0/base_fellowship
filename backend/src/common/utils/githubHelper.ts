// githubHelper.ts
export class GitHubHelper {
    private baseUrl: string;
    private graphqlUrl: string;
    private headers: HeadersInit;
  
    constructor(token?: string) {
      this.baseUrl = "https://api.github.com";
      this.graphqlUrl = "https://api.github.com/graphql";
      this.headers = {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      console.log('GitHubHelper initialized with baseUrl:', this.baseUrl);
    }
  
    /**
     * Helper method to handle rate limiting
     */
    private async handleRateLimit(response: Response): Promise<void> {
      if (response.status === 403) {
        console.log(response.headers.get('x-ratelimit-remaining'));
        console.log(`Rate limit reached. Waiting for 10 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  
    /**
     * Helper method to make GraphQL API calls with rate limit handling
     */
    private async makeGraphQLRequest(query: string, variables: any = {}): Promise<any> {
      console.log(`Making GraphQL request`);
      let response = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });
      
      if (response.status === 403) {
        await this.handleRateLimit(response);
        console.log('Retrying request after rate limit...');
        response = await fetch(this.graphqlUrl, {
          method: 'POST',
          headers: {
            ...this.headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, variables }),
        });
      }
  
      if (!response.ok) {
        console.error(`Request failed: ${response.statusText}`);
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
  
      const result = await response.json();
      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }
      return result.data;
    }

    /**
     * Fetch user details by GitHub username
     */
    async fetchUser(username: string): Promise<any> {
      console.log(`Fetching user details for: ${username}`);
      const query = `
        query($username: String!) {
          user(login: $username) {
            avatarUrl
            name
            login
            bio
            location
            createdAt
            url
            twitterUsername
            email
            websiteUrl
            followers {
              totalCount
            }
            repositories(privacy: PUBLIC) {
              totalCount
            }
          }
        }
      `;
      const data = await this.makeGraphQLRequest(query, { username });
      const user = data.user;
      
      // Calculate account age
      const createdAt = new Date(user.createdAt);
      const now = new Date();
      const accountAgeInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      return {
        avatar_url: user.avatarUrl,
        name: user.name,
        login: user.login,
        bio: user.bio,
        location: user.location,
        created_at: user.createdAt,
        html_url: user.url,
        twitter_username: user.twitterUsername,
        email: user.email,
        blog: user.websiteUrl,
        followers: user.followers.totalCount,
        public_repos: user.repositories.totalCount,
        accountAge: accountAgeInDays,
      };
    }
  
    /**
     * Fetch user repos with full details (languages, forks, stars)
     */
    async fetchUserReposWithDetails(username: string): Promise<any> {
      console.log(`Fetching detailed repository information for user: ${username}`);
      
      const query = `
        query($username: String!, $first: Int!, $after: String) {
          user(login: $username) {
            repositories(first: $first, after: $after, privacy: PUBLIC) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                name
                fullName: nameWithOwner
                description
                url
                forkCount
                stargazerCount
                watchers {
                  totalCount
                }
                issues {
                  totalCount
                }
                repositoryTopics(first: 10) {
                  nodes {
                    topic {
                      name
                    }
                  }
                }
                createdAt
                updatedAt
                pushedAt
                defaultBranchRef {
                  name
                }
                isPrivate
                languages(first: 20) {
                  edges {
                    size
                    node {
                      name
                    }
                  }
                }
                isFork
                parent {
                  nameWithOwner
                }
              }
            }
          }
        }
      `;

      let hasNextPage = true;
      let endCursor = null;
      let allRepos: any[] = [];
      
      while (hasNextPage) {
        const data = await this.makeGraphQLRequest(query, { 
          username, 
          first: 100,
          after: endCursor 
        });
        
        const repos = data.user.repositories;
        allRepos = [...allRepos, ...repos.nodes];
        
        hasNextPage = repos.pageInfo.hasNextPage;
        endCursor = repos.pageInfo.endCursor;
        
        // Add a small delay to avoid rate limiting
        if (hasNextPage) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      let totalForks = 0;
      let totalStars = 0;
      let totalLanguageLinesOfCode: any = {};
      
      const detailedRepos = allRepos.map((repo: {
        name: string;
        fullName: string;
        description: string | null;
        url: string;
        forkCount: number;
        stargazerCount: number;
        watchers: { totalCount: number };
        issues: { totalCount: number };
        repositoryTopics: { nodes: Array<{ topic: { name: string } }> };
        createdAt: string;
        updatedAt: string;
        pushedAt: string;
        defaultBranchRef: { name: string } | null;
        isPrivate: boolean;
        languages: { edges: Array<{ size: number; node: { name: string } }> };
        isFork: boolean;
        parent: { nameWithOwner: string } | null;
      }) => {
        // Only count forks that were created by the user (not inherited from parent)
        if (repo.isFork || repo.fullName.toLocaleLowerCase().includes(username)) {
          totalForks += repo.forkCount;
          totalStars += repo.stargazerCount;
        }

        // Process languages
        const languages: { [key: string]: number } = {};
        repo.languages.edges.forEach((edge: any) => {
          const language = edge.node.name;
          const size = edge.size;
          languages[language] = size;
          
          if (totalLanguageLinesOfCode[language]) {
            totalLanguageLinesOfCode[language] += size;
          } else {
            totalLanguageLinesOfCode[language] = size;
          }
        });

        return {
          name: repo.name,
          full_name: repo.fullName,
          description: repo.description,
          html_url: repo.url,
          forks_count: repo.isFork ? 0 : repo.forkCount,
          stargazers_count: repo.stargazerCount,
          watchers_count: repo.watchers.totalCount,
          open_issues_count: repo.issues.totalCount,
          topics: repo.repositoryTopics.nodes.map((node: any) => node.topic.name),
          created_at: repo.createdAt,
          updated_at: repo.updatedAt,
          pushed_at: repo.pushedAt,
          default_branch: repo.defaultBranchRef?.name,
          visibility: repo.isPrivate ? 'private' : 'public',
          languages,
          is_fork: repo.isFork,
          parent_repo: repo.parent?.nameWithOwner
        };
      });

      console.log(`Completed fetching detailed information for all ${detailedRepos.length} repositories`);
      return { detailedRepos, totalForks, totalStars, totalLanguageLinesOfCode };
    }

    async fetchUserOrganizations(username: string): Promise<any[]> {
        const url = `${this.baseUrl}/users/${username}/orgs`;
        const response = await fetch(url, { headers: this.headers });
      
        if (!response.ok) {
          throw new Error(`Failed to fetch organizations: ${response.statusText}`);
          }
        return response.json();
      }
      
      /**
       * Fetch user's public contribution events
       */
      async fetchUserContributionEvents(username: string): Promise<any[]> {
        const url = `${this.baseUrl}/users/${username}/events/public`;
        const response = await fetch(url, { headers: this.headers });
      
        if (!response.ok) {
          throw new Error(`Failed to fetch user events: ${response.statusText}`);
        }
        return response.json();
      }


      async analyzeUserContributions(username: string): Promise<ContributionStats> {
        const events = await this.fetchUserContributionEvents(username);
    
        const stats: ContributionStats = {
          totalPRs: 0,
          totalIssues: 0,
          totalCommits: 0,
          totalReviews: 0,
          repoContributions: {},
        };
    
        for (const event of events) {
          const repoName = event.repo.name;
    
          if (!stats.repoContributions[repoName]) {
            stats.repoContributions[repoName] = {
              commits: 0,
              pullRequests: 0,
              issues: 0,
              reviews: 0,
            };
          }
    
          switch (event.type) {
            case "PushEvent":
              const commitCount = event.payload.commits?.length || 0;
              stats.totalCommits += commitCount;
              stats.repoContributions[repoName].commits += commitCount;
              break;
            case "PullRequestEvent":
              if (event.payload.action === "opened") {
                stats.totalPRs += 1;
                stats.repoContributions[repoName].pullRequests += 1;
              }
              break;
            case "IssuesEvent":
              if (event.payload.action === "opened") {
                stats.totalIssues += 1;
                stats.repoContributions[repoName].issues += 1;
              }
              break;
            case "PullRequestReviewCommentEvent":
              stats.totalReviews += 1;
              stats.repoContributions[repoName].reviews += 1;
              break;
          }
        }
    
        return stats;
      }

      /**
       * Check if a GitHub username is valid
       * @param username The GitHub username to check
       * @returns Promise<boolean> True if username exists, false otherwise
       */
      async isValidUsername(username: string): Promise<boolean> {
        try {
          const query = `
            query($username: String!) {
              user(login: $username) {
                login
              }
            }
          `;
          const data = await this.makeGraphQLRequest(query, { username });
          return !!data.user;
        } catch (error) {
          return false;
        }
      }
  }
  

  interface ContributionStats {
    totalPRs: number;
    totalIssues: number;
    totalCommits: number;
    totalReviews: number;
    repoContributions: Record<string, {
      commits: number;
      pullRequests: number;
      issues: number;
      reviews: number;
    }>;
  }

