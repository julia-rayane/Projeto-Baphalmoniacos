import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbInstance: Database | null = null;

export async function obterConexao(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await open({
      filename: path.join(__dirname, 'baphalmoniacos.db'), 
      driver: sqlite3.Database
    });

    // 🚀 CRIA AS TABELAS AUTOMATICAMENTE SE ELAS NÃO EXISTIREM!
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        preco REAL NOT NULL,
        descricao TEXT,
        id_categoria_fk INTEGER,
        FOREIGN KEY (id_categoria_fk) REFERENCES categorias(id)
      );
    `);
    console.log('✅ Banco de dados inicializado e tabelas verificadas!');
  }
  return dbInstance;
}
