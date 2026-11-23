import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // Nos testes só erros aparecem; fora deles, as consultas aparecem no terminal
  log: process.env.NODE_ENV === 'test' ? ['error'] : ['query', 'info', 'warn', 'error'],
});

export default prisma;
