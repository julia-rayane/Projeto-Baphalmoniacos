// Apoio aos testes de rotas: cria usuários/tokens e limpa o que cada arquivo de teste criou.
// Todo dado usa um sufixo aleatório, então a suíte pode rodar várias vezes seguidas
// sem esbarrar em e-mail ou nome de produto duplicado.
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../src/database/database.js';
import { JWT_SECRET } from '../../src/config/auth.js';
import { uploadFolder } from '../../src/config/multer.js';

export const sufixo = () => randomUUID().slice(0, 8);
export const emailUnico = (prefixo = 'user') => `${prefixo}-${randomUUID()}@teste.local`;
export const autorizacao = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function criarUsuario(role: 'cliente' | 'admin' = 'cliente') {
  const senha = 'senha-forte-123';
  const usuario = await prisma.usuario.create({
    data: {
      nome: `Teste ${role} ${sufixo()}`,
      email: emailUnico(role),
      senha: await bcrypt.hash(senha, 4), // custo baixo: só para os testes ficarem rápidos
      role,
    },
  });
  const token = jwt.sign({ id: usuario.id, email: usuario.email, role: usuario.role }, JWT_SECRET, {
    expiresIn: '10m',
  });
  return { usuario, senha, token };
}

// Guarda os ids criados por um arquivo de teste e apaga tudo no final
export function criarLimpeza() {
  const ids = { usuarios: [] as number[], produtos: [] as number[], categorias: [] as number[] };

  return {
    ids,
    async executar() {
      // Apaga do disco as fotos dos usuários criados (a linha do banco some em cascata)
      const imagens = await prisma.image.findMany({ where: { usuarioId: { in: ids.usuarios } } });
      for (const imagem of imagens) {
        await fs.rm(path.join(uploadFolder, path.basename(imagem.path)), { force: true });
      }
      await prisma.produto.deleteMany({ where: { id: { in: ids.produtos } } });
      await prisma.categoria.deleteMany({ where: { id: { in: ids.categorias } } });
      await prisma.usuario.deleteMany({ where: { id: { in: ids.usuarios } } });
      await prisma.$disconnect();
    },
  };
}

// PNG válido de 1x1 pixel, para enviar como "foto" nos testes de upload
export const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);
