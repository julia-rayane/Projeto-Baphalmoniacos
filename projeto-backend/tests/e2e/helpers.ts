import crypto from 'node:crypto';
import type { Page } from '@playwright/test';

// Dados únicos por execução: o teste pode rodar quantas vezes quiser sem conflito de e-mail ou nome
export function criarUsuarioValido() {
  const hash = crypto.randomBytes(10).toString('hex');
  return {
    nome: `Cliente ${hash}`,
    email: `cliente-${hash}@e2e.test`,
    senha: 'senha-e2e-123',
    hash,
  };
}

// O site usa alert() para avisar o usuário. Este helper aceita cada alerta
// e guarda as mensagens para o teste conferir o que apareceu na tela.
export function aceitarAlertas(page: Page) {
  const mensagens: string[] = [];
  page.on('dialog', async (dialogo) => {
    mensagens.push(dialogo.message());
    await dialogo.accept();
  });
  return mensagens;
}

// PNG válido de 1x1 pixel para o upload da foto de perfil
export const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

export async function entrarPelaInterface(page: Page, email: string, senha: string) {
  await page.goto('/login.html');
  await page.getByLabel('E-mail de login').fill(email);
  await page.getByLabel('Senha de login').fill(senha);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}
