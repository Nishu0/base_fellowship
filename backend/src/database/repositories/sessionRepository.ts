import prisma from '../prisma/client';
import type { Prisma } from '@prisma/client';

/**
 * Repository for Session-related database operations
 */
export class SessionRepository {
  /**
   * Create a new session
   * @returns The created session
   */
  async createSession(): Promise<Prisma.SessionGetPayload<{}>> {
    return prisma.session.create({
      data: {},
    });
  }

  /**
   * Get a session by ID
   * @param id Session ID
   * @returns The session or null if not found
   */
  async getSessionById(id: string): Promise<Prisma.SessionGetPayload<{}> | null> {
    return prisma.session.findUnique({
      where: { id },
    });
  }

  /**
   * Get a session with all related messages
   * @param id Session ID
   * @returns The session with messages or null if not found
   */
  async getSessionWithMessages(id: string): Promise<Prisma.SessionGetPayload<{
    include: { messages: true }
  }> | null> {
    return prisma.session.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  /**
   * Get a session with its character file
   * @param id Session ID
   * @returns The session with character file or null if not found
   */
  async getSessionWithCharacterFile(id: string): Promise<Prisma.SessionGetPayload<{
    include: { characterFile: true }
  }> | null> {
    return prisma.session.findUnique({
      where: { id },
      include: {
        characterFile: true,
      },
    });
  }

  /**
   * Get a complete session with all related data
   * @param id Session ID
   * @returns The complete session or null if not found
   */
  async getCompleteSession(id: string): Promise<Prisma.SessionGetPayload<{
    include: { messages: true; characterFile: true }
  }> | null> {
    return prisma.session.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        characterFile: true,
      },
    });
  }

  /**
   * Delete a session and all related data
   * @param id Session ID
   * @returns The deleted session
   */
  async deleteSession(id: string): Promise<Prisma.SessionGetPayload<{}>> {
    return prisma.session.delete({
      where: { id },
    });
  }
} 