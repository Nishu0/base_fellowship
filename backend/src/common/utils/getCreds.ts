import { env } from "./envConfig"
import { Logger } from "./logger"

let GithubAccessTokens: string[] = []
let AlchemyApiKeys: string[] = []

let noOfGithubAccessTokens = 0
let noOfAlchemyApiKeys = 0

// Current indices for round-robin distribution
let currentGithubTokenIndex = 0
let currentAlchemyKeyIndex = 0

// Locks for token access
let githubTokenLock = false
let alchemyKeyLock = false

export async function LoadKeys() {
   const githubAccessTokens = env.GITHUB_ACCESS_TOKEN.split(",")
   const alchemyApiKeys = env.ALCHEMY_API_KEY.split(",")

   if(githubAccessTokens.length < 1 || alchemyApiKeys.length < 1) {
      throw new Error("Atleast One Github Access Token and One Alchemy Api Key is required")
   }

   if(githubAccessTokens.length > 0) {
      Logger.info("LoadKeys", "Loaded Github Access Tokens: ", { length: githubAccessTokens.length })
      GithubAccessTokens = githubAccessTokens
      noOfGithubAccessTokens = githubAccessTokens.length
   }

   if(alchemyApiKeys.length > 0) {
      Logger.info("LoadKeys", "Loaded Alchemy Api Keys: ", { length: alchemyApiKeys.length })
      AlchemyApiKeys = alchemyApiKeys
      noOfAlchemyApiKeys = alchemyApiKeys.length
   }
}

// Function to wait for lock to be released
async function waitForLock(lock: boolean): Promise<void> {
   while (lock) {
      await new Promise(resolve => setTimeout(resolve, 100)) // Wait for 100ms before checking again
   }
}

// Function to get next GitHub token in round-robin fashion
export async function getNextGithubToken(): Promise<string> {
   await waitForLock(githubTokenLock)
   githubTokenLock = true
   
   try {
      const token = GithubAccessTokens[currentGithubTokenIndex]
      currentGithubTokenIndex = (currentGithubTokenIndex + 1) % noOfGithubAccessTokens
      return token
   } finally {
      githubTokenLock = false
   }
}

// Function to get next Alchemy API key in round-robin fashion
export async function getNextAlchemyKey(): Promise<string> {
   await waitForLock(alchemyKeyLock)
   alchemyKeyLock = true
   
   try {
      const key = AlchemyApiKeys[currentAlchemyKeyIndex]
      currentAlchemyKeyIndex = (currentAlchemyKeyIndex + 1) % noOfAlchemyApiKeys
      return key
   } finally {
      alchemyKeyLock = false
   }
}




