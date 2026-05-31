import { conectarBanco } from './database.js';

export async function rodarMigrations() {
  const db = await conectarBanco();

  console.log('--- Criando as tabelas no banco de dados ---');

  // 1. Tabela de Categorias (Ajustada para o padrão nome_categoria)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categoria (
      id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_categoria TEXT NOT NULL,
      icone TEXT
    );
  `);

  // 2. Tabela de Produtos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS produto (
      id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT NOT NULL,
      preco REAL NOT NULL,
      disponibilidade INTEGER DEFAULT 1,
      foto TEXT,
      id_categoria_fk INTEGER,
      FOREIGN KEY (id_categoria_fk) REFERENCES categoria(id_categoria)
    );
  `);

  console.log('--- Migrations aplicadas com sucesso! ---');
}

// Executa automaticamente se o arquivo for chamado direto no terminal
if (import.meta.url === `file://${process.argv[1]}`) {
  rodarMigrations();
}
