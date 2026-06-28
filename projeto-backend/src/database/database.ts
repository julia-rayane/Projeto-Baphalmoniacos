import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Isso faz as buscas aparecerem no terminal 
});

export default prisma;
