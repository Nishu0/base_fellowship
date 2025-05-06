export interface AnalyzeUserRequest {
    githubUsername: string;
    addresses: string[];
}

export interface AnalyzeUserResponse {
    success: boolean;
    data?: any;
    error?: string;
} 