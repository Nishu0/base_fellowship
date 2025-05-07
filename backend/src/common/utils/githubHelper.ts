// githubHelper.ts
export class GitHubHelper {
    private baseUrl: string;
    private headers: HeadersInit;
  
    constructor(token?: string) {
      this.baseUrl = "https://api.github.com";
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
     * Helper method to make API calls with rate limit handling
     */
    private async makeRequest(url: string): Promise<Response> {
      console.log(`Making request to: ${url}`);
      let response = await fetch(url, { headers: this.headers });
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      if (response.status === 403) {
        await this.handleRateLimit(response);
        console.log('Retrying request after rate limit...');
        response = await fetch(url, { headers: this.headers });
        console.log(`Retry response status: ${response.status} ${response.statusText}`);
      }
  
      if (!response.ok) {
        console.error(`Request failed: ${response.statusText}`);
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
  
      return response;
    }
  
    /**
     * Fetch user details by GitHub username
     */
    async fetchUser(username: string): Promise<any> {
      console.log(`Fetching user details for: ${username}`);
      const url = `${this.baseUrl}/users/${username}`;
      const response = await this.makeRequest(url);
      const data = await response.json();
      console.log(`User data retrieved for ${username}:`, {
        login: data.login,
        name: data.name,
        public_repos: data.public_repos,
        followers: data.followers,
        following: data.following
      });
      return data;
    }
  
    /**
     * Fetch all public repositories of a user
     */
    async fetchUserRepos(username: string): Promise<any[]> {
      console.log(`Fetching repositories for user: ${username}`);
      const url = `${this.baseUrl}/users/${username}/repos?per_page=100&type=all&sort=updated`;
      const response = await this.makeRequest(url);
      const repos = await response.json();
      console.log(`Retrieved ${repos.length} repositories for ${username}`);
      return repos;
    }
  
    /**
     * Fetch languages used in a repository
     */
    async fetchRepoLanguages(owner: string, repo: string): Promise<{ [language: string]: number }> {
      console.log(`Fetching languages for repo: ${owner}/${repo}`);
      const url = `${this.baseUrl}/repos/${owner}/${repo}/languages`;
      const response = await this.makeRequest(url);
      const languages = await response.json();
      console.log(`Languages for ${owner}/${repo}:`, languages);
      return languages;
    }
  
    /**
     * Fetch full repo details (with languages merged)
     */
    async fetchFullRepoDetails(owner: string, repo: string): Promise<any> {
      console.log(`Fetching full details for repo: ${owner}/${repo}`);
      const repoUrl = `${this.baseUrl}/repos/${owner}/${repo}`;
      const repoRes = await this.makeRequest(repoUrl);
      const repoData = await repoRes.json();
      console.log(`Basic repo data retrieved for ${owner}/${repo}:`, {
        name: repoData.name,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        open_issues: repoData.open_issues_count
      });
      
      const languages = await this.fetchRepoLanguages(owner, repo);
      const fullData = {
        ...repoData,
        languages,
      };
      console.log(`Full repo details retrieved for ${owner}/${repo}`);
      return fullData;
    }
  
    /**
     * Fetch user repos with full details (languages, forks, stars)
     */
    async fetchUserReposWithDetails(username: string): Promise<any> {
      console.log(`Fetching detailed repository information for user: ${username}`);
      const repos = await this.fetchUserRepos(username);
      console.log(`Processing ${repos.length} repositories for detailed information`);

      let totalForks = 0
      let totalStars = 0
      let totalLanguageLinesOfCode: any = {}
      
      const detailedRepos = await Promise.all(
        repos.map(async (repo) => {
          console.log(`Fetching languages for repo: ${repo.full_name}`);
          const languages = await this.fetchRepoLanguages(repo.owner.login, repo.name);


          Object.keys(languages).map((langauge) => {
            if(totalLanguageLinesOfCode[langauge])
            totalLanguageLinesOfCode[langauge]+= languages[langauge]
            else
            totalLanguageLinesOfCode[langauge] = languages[langauge]
          })

          totalForks += repo.forks_count
          totalStars += repo.stargazers_count

          const detailedRepo = {
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            forks_count: repo.forks_count,
            stargazers_count: repo.stargazers_count,
            watchers_count: repo.watchers_count,
            open_issues_count: repo.open_issues_count,
            topics: repo.topics,
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            pushed_at: repo.pushed_at,
            default_branch: repo.default_branch,
            visibility: repo.visibility,
            languages,
          };
          console.log(`Detailed information retrieved for repo: ${repo.full_name}`);
          return detailedRepo;
        })
      );
  
      console.log(`Completed fetching detailed information for all ${detailedRepos.length} repositories`);
      return {detailedRepos, totalForks, totalStars, totalLanguageLinesOfCode};
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

