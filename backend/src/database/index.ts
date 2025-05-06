import prisma from './prisma/client';
import { SessionRepository } from './repositories/sessionRepository';
import { MessageRepository } from './repositories/messageRepository';
import { CharacterFileRepository } from './repositories/characterFileRepository';

// Export repositories
export { SessionRepository } from './repositories/sessionRepository';
export { MessageRepository } from './repositories/messageRepository';
export { CharacterFileRepository } from './repositories/characterFileRepository';

// Database service class
export class DatabaseService {
  private static instance: DatabaseService;
  
  public readonly sessions: SessionRepository;
  public readonly messages: MessageRepository;
  public readonly characterFiles: CharacterFileRepository;
  
  private constructor() {
    this.sessions = new SessionRepository();
    this.messages = new MessageRepository();
    this.characterFiles = new CharacterFileRepository();
  }
  
  /**
   * Get the singleton instance of DatabaseService
   * @returns DatabaseService instance
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
  
  /**
   * Connect to the database
   */
  public async connect(): Promise<void> {
    await prisma.$connect();
  }
  
  /**
   * Disconnect from the database
   */
  public async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

// Export the prisma client
export { prisma }; 