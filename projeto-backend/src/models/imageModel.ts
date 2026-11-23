import fs from 'node:fs/promises';
import path from 'node:path';
import prisma from '../database/database.js';
import { uploadFolder } from '../config/multer.js';

async function findByUser(usuarioId: number) {
  return prisma.image.findUnique({ where: { usuarioId } });
}

// Regra "um arquivo por usuário": se já existe registro, só troca o caminho.
async function upsert({ usuarioId, caminho }: { usuarioId: number; caminho: string }) {
  return prisma.image.upsert({
    where: { usuarioId },
    update: { path: caminho },
    create: { path: caminho, usuario: { connect: { id: usuarioId } } },
  });
}

// Apaga o arquivo físico a partir do caminho público (ex.: /imgs/profile/abc.png).
// Usa só o nome do arquivo para nunca sair da pasta de uploads.
async function removeFile(publicPath: string) {
  const fileName = path.basename(publicPath);
  try {
    await fs.unlink(path.join(uploadFolder, fileName));
  } catch {
    // arquivo já não existe: nada a fazer
  }
}

export default { findByUser, upsert, removeFile };
