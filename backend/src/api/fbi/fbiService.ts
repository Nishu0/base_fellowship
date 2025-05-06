import { OnchainDataManager } from './../../common/utils/OnchainDataManager';
import { GitHubHelper } from './../../common/utils/githubHelper';
import { AnalyzeUserRequest, AnalyzeUserResponse } from './fbiModel';
import { env } from '@/common/utils/envConfig';
import { GitHubGraphQLHelper } from '@/common/utils/githubHelperGraphql';

export class FbiService {
    async analyzeUser(request: AnalyzeUserRequest): Promise<AnalyzeUserResponse> {
        try {
            const githubHelper = new GitHubHelper(env.GITHUB_ACCESS_TOKEN);
            const onchainDataManager = new OnchainDataManager(env.ALCHEMY_API_KEY);
            const githubGraphHelper = new GitHubGraphQLHelper(env.GITHUB_ACCESS_TOKEN);


            const userData = await githubHelper.fetchUser(request.githubUsername);
            const repos = await githubHelper.fetchUserReposWithDetails(request.githubUsername);
            const contractsDeployed = await onchainDataManager.getContractsDeployedByAddress(request.addresses[0], "0x0", "latest");
            const organizations = await githubHelper.fetchUserOrganizations(request.githubUsername);
            const onchainHistory = await onchainDataManager.getOnchainHistoryForAddresses(request.addresses, "0x0", "latest")
            const allContributions = await githubGraphHelper.getUserContributions(
                "mbcse",
                "2025-01-01T00:00:00Z",
                "2025-12-31T23:59:59Z"
              );
            return {
                success: true,
                data: {
                    githubUsername: request.githubUsername,
                    addresses: request.addresses,
                    userData: userData,
                    repos: repos,
                    contractsDeployed: contractsDeployed,
                    organizations: organizations,
                    contributionData: allContributions,
                    onchainHistory : onchainHistory
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
} 