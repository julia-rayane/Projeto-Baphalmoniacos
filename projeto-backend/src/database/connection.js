import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função que abre a conexão com o arquivo do banco de dados
export async function getDatabaseConnection() {
  return open({
    filename: path.join(__dirname, 'baphalmoniacos.db'),
    driver: sqlite3.Database
  });
}

// Criando as tabelas iniciais caso não existam
export async function runMigrations(db) {
  console.log('--- Executando Migrations (Criando Tabelas) ---');
  
  // 1. Tabela de Categorias
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categoria (
      id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      icone TEXT
    );
  `);

  // 2. Tabela de Produtos (Cardápio)
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
  
  console.log('Migrations concluídas!');
}

// Inserindo os dados iniciais do cardápio caso o banco esteja vazio
export async function runSeeds(db) {
  const categorias = await db.all('SELECT * FROM categoria');
  
  if (categorias.length === 0) {
    console.log('--- Executando Seeds (Populando Dados) ---');
    
    // Inserir categoria padrão
    const resultCat = await db.run(
      "INSERT INTO categoria (nome, icone) VALUES ('Pratos Principais', 'plate.png')"
    );
    const catId = resultCat.lastID;
    console.log('Categorias iniciais inseridas!');

    // CORRIGIDO: Inserir pratos com as descrições reais e apetitosas para o cardápio
    await db.run(`
      INSERT INTO produto (nome, descricao, preco, disponibilidade, foto, id_categoria_fk) VALUES 
      ('Lámen Especial', 'Macarrão coreano tradicional servido em um caldo quente e apimentado com vegetais frescos e ovo.', 22.50, 1, 'buchimgae.png', ${catId}),
      ('Bibimbap Mix', 'Tradicional tigela de arroz coberta com um mix de vegetais coloridos, carne marinada e ovo frito.', 36.00, 1, 'buchimgae.png', ${catId}),
      ('Tteokbokki', 'Bolinhos de arroz super macios e mastigáveis, cozidos em um delicioso molho de pimenta doce.', 28.00, 1, 'tteokbokki.png', ${catId})
    `);
    
    console.log('Produtos do cardápio inseridos com sucesso!');
  }
}
