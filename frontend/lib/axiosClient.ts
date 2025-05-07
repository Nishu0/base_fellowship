import { env } from "@/config/env";
import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";

interface CustomAxiosConfig extends CreateAxiosDefaults {
  manualCookie?: string;
}

export const createApiClient = (config?: CustomAxiosConfig): AxiosInstance => {
  const defaultConfig: CreateAxiosDefaults = {
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // If manual cookie is provided, add it to headers and disable withCredentials
  if (config?.manualCookie) {
    defaultConfig.withCredentials = false;
    defaultConfig.headers = {
      ...defaultConfig.headers,
      Cookie: config.manualCookie,
    };
  }

  // Merge default config with provided config
  const finalConfig = {
    ...defaultConfig,
    ...config,
  };

  return axios.create(finalConfig);
};

const api = createApiClient({
  baseURL: env.API_URL,
  withCredentials: true,
});

export { api };