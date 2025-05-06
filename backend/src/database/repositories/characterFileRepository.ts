import prisma from '../prisma/client';
import type { Prisma } from '@prisma/client';

/**
 * Repository for CharacterFile-related database operations
 */
export class CharacterFileRepository {
  /**
   * Create a new character file
   * @param data Character file data
   * @returns The created character file
   */
  async createCharacterFile(data: {
    content: any;
    sessionId: string;
  }): Promise<Prisma.CharacterFileGetPayload<{}>> {
    // Check if a character file already exists for this session
    const existingFile = await prisma.characterFile.findUnique({
      where: { sessionId: data.sessionId },
    });

    if (existingFile) {
      // Update the existing character file
      return prisma.characterFile.update({
        where: { id: existingFile.id },
        data: {
          content: data.content,
        },
      });
    }

    // Create a new character file
    return prisma.characterFile.create({
      data,
    });
  }

  /**
   * Get a character file by ID
   * @param id Character file ID
   * @returns The character file or null if not found
   */
  async getCharacterFileById(id: string): Promise<Prisma.CharacterFileGetPayload<{}> | null> {
    return prisma.characterFile.findUnique({
      where: { id },
    });
  }

  /**
   * Get a character file by session ID
   * @param sessionId Session ID
   * @returns The character file or null if not found
   */
  async getCharacterFileBySessionId(sessionId: string): Promise<Prisma.CharacterFileGetPayload<{}> | null> {
    return prisma.characterFile.findUnique({
      where: { sessionId },
    });
  }

  /**
   * Delete a character file
   * @param id Character file ID
   * @returns The deleted character file
   */
  async deleteCharacterFile(id: string): Promise<Prisma.CharacterFileGetPayload<{}>> {
    return prisma.characterFile.delete({
      where: { id },
    });
  }

  /**
   * Delete a character file by session ID
   * @param sessionId Session ID
   * @returns The deleted character file or null if not found
   */
  async deleteCharacterFileBySessionId(sessionId: string): Promise<Prisma.CharacterFileGetPayload<{}> | null> {
    const file = await this.getCharacterFileBySessionId(sessionId);
    if (!file) return null;
    
    return prisma.characterFile.delete({
      where: { id: file.id },
    });
  }
} 