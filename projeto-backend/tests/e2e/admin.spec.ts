import crypto from 'node:crypto';
import { test, expect } from '@playwright/test';
import { aceitarAlertas, entrarPelaInterface } from './helpers';

test.describe('Fluxo do administrador', () => {
  test('visitante sem login não consegue abrir o painel e vai para o login', async ({ page }) => {
    const alertas = aceitarAlertas(page);

    await page.goto('/admin.html');

    await page.waitForURL('**/login.html');
    expect(alertas.join(' | ')).toContain('Acesso restrito a administradores');
  });

  test('admin cria categoria e prato pelo painel e o prato aparece no cardápio', async ({ page }) => {
    const hash = crypto.randomBytes(10).toString('hex');
    const categoria = `Categoria E2E ${hash}`;
    const prato = `Prato E2E ${hash}`;
    const alertas = aceitarAlertas(page);

    // Login como admin (criado no global-setup) leva ao painel
    await entrarPelaInterface(page, process.env.E2E_ADMIN_EMAIL!, process.env.E2E_ADMIN_PASSWORD!);
    await page.waitForURL('**/admin.html');
    await expect(page.getByRole('heading', { name: 'Painel de Controle' })).toBeVisible();

    // Cria a categoria
    await page.getByLabel('Nome da Categoria:').fill(categoria);
    await page.getByRole('button', { name: 'Salvar Categoria' }).click();
    await expect.poll(() => alertas.join(' | ')).toContain('Categoria adicionada com sucesso!');

    // Cria o prato dentro dessa categoria
    await page.getByLabel('Nome do Prato/Item:').fill(prato);
    await page.getByLabel('Preço (R$):').fill('41.90');
    await page.getByLabel('Descrição:').fill('Prato criado pelo teste de ponta a ponta');
    await page.getByLabel('Categoria:', { exact: true }).selectOption({ label: categoria });
    await page.getByRole('button', { name: 'Salvar Produto no Cardápio' }).click();
    await expect.poll(() => alertas.join(' | ')).toContain('Prato adicionado ao cardápio!');

    // Resultado na tela: o prato aparece no cardápio público, com o preço
    await page.goto('/cardapio.html');
    await expect(page.getByRole('heading', { name: prato })).toBeVisible();
    await expect(page.locator('.card', { hasText: prato })).toContainText('R$ 41.90');
  });
});
