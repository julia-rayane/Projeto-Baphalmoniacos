// Roda uma vez depois dos testes E2E: apaga do disco as fotos enviadas durante o teste.
// Só remove arquivos que o banco do E2E conhece, então nunca toca em fotos reais de desenvolvimento.
import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

export default async function globalTeardown() {
  const pasta = path.resolve('public', 'imgs', 'profile');
  const prisma = new PrismaClient();
  try {
    const imagens = await prisma.image.findMany();
    for (const imagem of imagens) {
      await fs.rm(path.join(pasta, path.basename(imagem.path)), { force: true });
    }
  } finally {
    await prisma.$disconnect();
  }
}
