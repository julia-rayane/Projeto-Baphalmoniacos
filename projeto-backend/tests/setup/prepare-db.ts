// Recria do zero o banco SQLite descartável usado pelos testes (rotas e E2E).
// Uso: node --env-file=.env.test --import tsx tests/setup/prepare-db.ts
// (os scripts "db:prepare:test" e "db:prepare:e2e" do package.json já fazem isso)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const url = process.env.DATABASE_URL;

if (!url || !url.startsWith('file:')) {
  throw new Error('DATABASE_URL (SQLite, "file:...") não definida. Use os scripts do package.json.');
}

// Trava de segurança: este script APAGA o arquivo, então só aceita bancos de teste.
const nomeDoArquivo = path.basename(url.slice('file:'.length));
if (!/(test|e2e)/.test(nomeDoArquivo)) {
  throw new Error(`Recusado: "${nomeDoArquivo}" não parece um banco de teste (precisa conter "test" ou "e2e").`);
}

// Caminhos relativos em "file:" são resolvidos a partir da pasta do schema.prisma
const arquivo = path.resolve('prisma', url.slice('file:'.length));
for (const sufixo of ['', '-journal']) {
  fs.rmSync(arquivo + sufixo, { force: true });
}

// Cria as tabelas a partir do schema.prisma (e gera o Prisma Client, se preciso)
execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: process.env });
