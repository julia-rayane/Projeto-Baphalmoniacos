import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbInstance: Database | null = null;

// Função para obter a conexão com o banco de forma assíncrona e tipada
export async function obterConexao(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await open({
      // Aponta exatamente para o arquivo de banco de dados SQLite de vocês
      filename: path.join(__dirname, 'baphalmoniacos.db'), 
      driver: sqlite3.Database
    });
  }
  return dbInstance;
}
