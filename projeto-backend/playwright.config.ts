import { defineConfig, devices } from '@playwright/test';

// Carrega o ambiente do E2E (porta, banco descartável, SMTP inalcançável, admin do teste).
// O servidor iniciado pelo webServer herda estas variáveis.
process.loadEnvFile('.env.e2e');

const PORT = Number(process.env.PORT);

export default defineConfig({
  testDir: './tests/e2e',
  // Um worker só: o banco SQLite é compartilhado e o fluxo é curto
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  // O Playwright sobe o servidor real antes dos testes e o encerra no final.
  // (O banco é recriado antes disso pelo script "npm run e2e".)
  webServer: {
    command: 'node --import tsx src/index.ts',
    url: `http://localhost:${PORT}/login.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
