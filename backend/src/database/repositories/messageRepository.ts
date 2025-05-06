import prisma from '../prisma/client';
import type { Prisma } from '@prisma/client';

/**
 * Repository for Message-related database operations
 */
export class MessageRepository {
  /**
   * Create a new message
   * @param data Message data
   * @returns The created message
   */
  async createMessage(data: {
    content: string;
    role: string;
    sessionId: string;
  }): Promise<Prisma.MessageGetPayload<{}>> {
    return prisma.message.create({
      data,
    });
  }

  /**
   * Get a message by ID
   * @param id Message ID
   * @returns The message or null if not found
   */
  async getMessageById(id: string): Promise<Prisma.MessageGetPayload<{}> | null> {
    return prisma.message.findUnique({
      where: { id },
    });
  }

  /**
   * Get all messages for a session
   * @param sessionId Session ID
   * @returns Array of messages
   */
  async getMessagesBySessionId(sessionId: string): Promise<Prisma.MessageGetPayload<{}>[]> {
    return prisma.message.findMany({
      where: { sessionId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Delete a message
   * @param id Message ID
   * @returns The deleted message
   */
  async deleteMessage(id: string): Promise<Prisma.MessageGetPayload<{}>> {
    return prisma.message.delete({
      where: { id },
    });
  }

  /**
   * Delete all messages for a session
   * @param sessionId Session ID
   * @returns Count of deleted messages
   */
  async deleteMessagesBySessionId(sessionId: string): Promise<Prisma.BatchPayload> {
    return prisma.message.deleteMany({
      where: { sessionId },
    });
  }
} 