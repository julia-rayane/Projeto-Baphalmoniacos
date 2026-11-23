import { test, expect } from '@playwright/test';
import { PNG_1X1, aceitarAlertas, criarUsuarioValido, entrarPelaInterface } from './helpers';

test.describe('Fluxo do cliente', () => {
  test('cadastra, entra, envia a foto de perfil e a vê na tela', async ({ page }) => {
    const usuario = criarUsuarioValido();
    const alertas = aceitarAlertas(page);

    // Cadastro
    await page.goto('/login.html');
    await page.getByLabel('Nome completo').fill(usuario.nome);
    await page.getByLabel('E-mail de cadastro').fill(usuario.email);
    await page.getByLabel('Senha de cadastro').fill(usuario.senha);
    await page.getByRole('button', { name: 'Finalizar Registo' }).click();
    await expect.poll(() => alertas.join(' | ')).toContain('Conta criada com sucesso');

    // Login: cliente é levado para o perfil
    await entrarPelaInterface(page, usuario.email, usuario.senha);
    await page.waitForURL('**/perfil.html');
    await expect.poll(() => alertas.join(' | ')).toContain(`Bem-vindo(a), ${usuario.nome}`);

    // O perfil mostra os dados do usuário e ainda a imagem padrão
    await expect(page.getByRole('heading', { name: usuario.nome })).toBeVisible();
    await expect(page.getByText(usuario.email)).toBeVisible();
    const foto = page.getByRole('img', { name: 'Foto do usuário' });
    await expect(foto).toHaveAttribute('src', '/imgs/avatar-padrao.svg');

    // Criação do registro pela interface: envio da foto
    const botaoEnviar = page.getByRole('button', { name: 'Atualizar Foto' });
    await expect(botaoEnviar).toBeDisabled();
    await page
      .getByLabel('Selecionar nova foto de perfil')
      .setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: PNG_1X1 });
    await expect(botaoEnviar).toBeEnabled();
    await botaoEnviar.click();

    // Resultado na tela: mensagem de sucesso e a foto passa a vir do servidor
    await expect(page.getByRole('status')).toHaveText('Foto atualizada com sucesso!');
    await expect(foto).toHaveAttribute('src', /^\/imgs\/profile\/[a-f0-9]{32}\.png$/);

    // A foto continua lá depois de recarregar (ou seja, foi gravada de verdade)
    await page.reload();
    await expect(page.getByRole('heading', { name: usuario.nome })).toBeVisible();
    await expect(foto).toHaveAttribute('src', /^\/imgs\/profile\/[a-f0-9]{32}\.png$/);

    // Logout: volta para o login e o perfil deixa de ser acessível
    await page.getByRole('button', { name: 'Sair da Conta' }).click();
    await page.waitForURL('**/login.html');
    await page.goto('/perfil.html');
    await page.waitForURL('**/login.html');
    expect(alertas.join(' | ')).toContain('Você precisa fazer login');
  });

  test('login com senha errada mostra o erro e não sai da página de login', async ({ page }) => {
    const usuario = criarUsuarioValido();
    const alertas = aceitarAlertas(page);

    await entrarPelaInterface(page, usuario.email, 'senha-que-nao-existe');

    await expect.poll(() => alertas.join(' | ')).toContain('Credenciais inválidas.');
    await expect(page).toHaveURL(/login\.html$/);
  });

  test('cadastro com e-mail já usado é recusado', async ({ page }) => {
    const usuario = criarUsuarioValido();
    const alertas = aceitarAlertas(page);

    for (let tentativa = 0; tentativa < 2; tentativa++) {
      await page.goto('/login.html');
      await page.getByLabel('Nome completo').fill(usuario.nome);
      await page.getByLabel('E-mail de cadastro').fill(usuario.email);
      await page.getByLabel('Senha de cadastro').fill(usuario.senha);
      await page.getByRole('button', { name: 'Finalizar Registo' }).click();
      await expect.poll(() => alertas.length).toBe(tentativa + 1);
    }

    expect(alertas[0]).toContain('Conta criada com sucesso');
    expect(alertas[1]).toBe('E-mail já cadastrado.');
  });
});
