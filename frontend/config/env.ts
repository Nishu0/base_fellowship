export type ENV = {
    API_URL: string;
  };
  
  export const env: ENV = {
    API_URL: process.env.NEXT_PUBLIC_API_URL!,
  } as const;