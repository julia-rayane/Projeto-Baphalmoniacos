// Roda uma vez antes dos testes E2E: cria o administrador do teste no banco descartável.
// (O banco já foi recriado do zero por "npm run db:prepare:e2e".)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export default async function globalSetup() {
  const email = process.env.E2E_ADMIN_EMAIL;
  const senha = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !senha) {
    throw new Error('E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD precisam estar definidos em .env.e2e');
  }

  const prisma = new PrismaClient();
  try {
    await prisma.usuario.upsert({
      where: { email },
      update: { role: 'admin' },
      create: { nome: 'Admin E2E', email, senha: await bcrypt.hash(senha, 4), role: 'admin' },
    });
  } finally {
    await prisma.$disconnect();
  }
}
