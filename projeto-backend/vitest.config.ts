import { defineConfig } from 'vitest/config';

// Testes do front-end (public/js): rodam em JSDOM, sem navegador e sem servidor.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/front/**/*.test.js'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['public/js/**/*.js'],
      // "text" imprime, por arquivo, as linhas não cobertas (coluna "Uncovered Line #s")
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage/front',
      // Piso mínimo: se a cobertura cair abaixo disso, o comando falha
      thresholds: { lines: 85, functions: 85, statements: 85, branches: 75 },
    },
  },
});
