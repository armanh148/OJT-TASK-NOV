import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // Prevent multiple PrismaClient instances in development/hot-reload
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('[Database] Connected to PostgreSQL successfully.');
  } catch (error) {
    console.error('[Database] Connection failure:', error);
    // In test or initial development, continue without crashing so mock or offline tests can run
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('[Database] Disconnected from PostgreSQL.');
}
