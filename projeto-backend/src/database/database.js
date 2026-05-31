import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função padrão que todo o seu projeto (Model, Migrations, Seeds) vai usar
export async function conectarBanco() {
  return open({
    filename: path.join(__dirname, 'baphalmoniacos.db'),
    driver: sqlite3.Database
  });
}
