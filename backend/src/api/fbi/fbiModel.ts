export interface AnalyzeUserRequest {
    githubUsername: string;
    addresses: string[];
    forceRefresh?: boolean;
}

export interface AnalyzeUserResponse {
    success: boolean;
    data?: any;
    error?: string;
} 