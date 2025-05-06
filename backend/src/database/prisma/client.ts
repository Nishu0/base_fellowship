import { PrismaClient } from '@prisma/client';

// Create a singleton instance of the PrismaClient
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma; 