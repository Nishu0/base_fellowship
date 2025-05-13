import { Network, Alchemy, AlchemySettings } from 'alchemy-sdk';

// Define fallback providers (you can add more alternatives here)
const FALLBACK_RPC_ENDPOINTS: Record<string, string[]> = {
  'OPT_MAINNET': [
    'https://mainnet.optimism.io',
    'https://optimism-mainnet.public.blastapi.io',
  ],
  'ETH_MAINNET': [
    'https://eth-mainnet.public.blastapi.io',
    'https://ethereum.publicnode.com',
  ],
  'BASE_MAINNET': [
    'https://mainnet.base.org',
    'https://base.publicnode.com',
  ],
  'ETH_SEPOLIA': [
    'https://rpc.sepolia.org',
    'https://ethereum-sepolia.publicnode.com',
  ],
  'BASE_SEPOLIA': [
    'https://sepolia.base.org',
    'https://base-sepolia.publicnode.com',
  ],
  // Add other networks as needed
};

interface ProviderOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  useFallbacks?: boolean;
}

// Create a simple logger since we don't know the structure of the project's logger
const consoleLogger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
};

/**
 * Creates an enhanced Alchemy provider with retries and fallbacks
 */
export function createAlchemyProvider(
  network: Network, 
  options: ProviderOptions = {}
): Alchemy {
  const { 
    maxRetries = 5, 
    retryDelayMs = 1000, 
    timeoutMs = 30000,
    useFallbacks = true
  } = options;
  
  const apiKey = process.env.ALCHEMY_API_KEY;
  
  if (!apiKey) {
    consoleLogger.warn('ALCHEMY_API_KEY not found in environment variables');
  }
  
  const settings: AlchemySettings = {
    apiKey,
    network,
    maxRetries,
  };
  
  const provider = new Alchemy(settings);
  
  // Enhance the provider with better error handling if possible
  // This is somewhat risky as it depends on Alchemy's internal structure
  try {
    // @ts-ignore - Alchemy SDK internals might change
    const coreProvider = provider.core.provider;
    if (coreProvider && typeof coreProvider.send === 'function') {
      const originalSend = coreProvider.send;
      // @ts-ignore - Monkey patching the send method
      coreProvider.send = async function(method: string, params: any[]) {
        try {
          return await originalSend.call(this, method, params);
        } catch (error) {
          consoleLogger.error(`Alchemy request failed for ${method}:`, error);
          
          // If fallbacks are enabled and we have alternatives for this network
          if (useFallbacks && FALLBACK_RPC_ENDPOINTS[network]) {
            return await tryFallbackProviders(network.toString(), method, params);
          }
          
          throw error;
        }
      };
    }
  } catch (error) {
    consoleLogger.warn('Could not enhance Alchemy provider:', error);
  }
  
  return provider;
}

/**
 * Attempts to use fallback providers when the primary Alchemy provider fails
 */
async function tryFallbackProviders(networkKey: string, method: string, params: any[]) {
  const fallbacks = FALLBACK_RPC_ENDPOINTS[networkKey];
  if (!fallbacks || fallbacks.length === 0) {
    throw new Error(`No fallback providers available for ${networkKey}`);
  }
  
  // Try each fallback in sequence
  for (const rpcUrl of fallbacks) {
    try {
      consoleLogger.info(`Trying fallback provider: ${rpcUrl}`);
      
      // Create a simple JSON-RPC request
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
        // Node-fetch doesn't support timeout in RequestInit, so we'll use AbortController instead
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message || 'RPC Error');
      }
      
      consoleLogger.info(`Fallback provider ${rpcUrl} succeeded`);
      return result.result;
    } catch (error) {
      consoleLogger.error(`Fallback provider ${rpcUrl} failed:`, error);
      // Continue to the next fallback
    }
  }
  
  throw new Error(`All fallback providers for ${networkKey} failed`);
}

/**
 * Get a cached Alchemy provider - reuse instances to avoid creating too many
 */
const providerCache = new Map<Network, Alchemy>();

export function getAlchemyProvider(network: Network): Alchemy {
  if (!providerCache.has(network)) {
    providerCache.set(network, createAlchemyProvider(network));
  }
  return providerCache.get(network)!;
}

/**
 * Clear the provider cache - useful for testing
 */
export function clearProviderCache() {
  providerCache.clear();
} 