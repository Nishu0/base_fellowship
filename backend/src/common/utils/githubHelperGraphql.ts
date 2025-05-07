interface ContributionStats {
    totalContributions: number;
    contributionCalendar: any;
    totalPRs: number;
    totalIssues: number;
    repoContributions: Record<string, number>; // repo -> total commits
  }
  
  export class GitHubGraphQLHelper {
    private baseUrl = "https://api.github.com/graphql";
    private headers: HeadersInit;
  
    constructor(private token: string) {
      this.headers = {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
      };
    }
  
    private async graphqlRequest(query: string, variables: Record<string, any>): Promise<any> {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ query, variables }),
      });
  
      if (!response.ok) {
        throw new Error(`GraphQL Error: ${response.statusText}`);
      }
  
      const { data } = await response.json();
      return data;
    }
  
    async getUserContributions(username: string, from?: string, to?: string): Promise<ContributionStats> {
      const query = `
        query($login: String!, $from: DateTime, $to: DateTime) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                    contributionDays {
                        date
                        contributionCount
                        color
                        weekday
                    }
                }
              }
              pullRequestContributions(first: 100) {
                totalCount
              }
              issueContributions(first: 100) {
                totalCount
              }
              commitContributionsByRepository(maxRepositories: 100) {
                repository {
                  nameWithOwner
                }
                contributions {
                  totalCount
                }
              }
            }
          }
        }
      `;
  
      const variables: Record<string, any> = { login: username };
      if (from) variables.from = from;
      if (to) variables.to = to;
  
      const data = await this.graphqlRequest(query, variables);
      // console.log(data)
      const collection = data.user.contributionsCollection;
      // console.log(collection)
  
      const repoContributions: Record<string, number> = {};
      for (const repo of collection.commitContributionsByRepository) {
        repoContributions[repo.repository.nameWithOwner] = repo.contributions.totalCount;
      }
  
      return {
        totalContributions: collection.contributionCalendar.totalContributions,
        contributionCalendar: collection.contributionCalendar,
        totalPRs: collection.pullRequestContributions.totalCount,
        totalIssues: collection.issueContributions.totalCount,
        repoContributions,
      };
    }
  }
  