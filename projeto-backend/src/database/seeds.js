import { conectarBanco } from './connection.js';

export async function rodarSeeds() {
  const db = await conectarBanco();

  console.log('--- Populando o banco de dados (Seeds) ---');

  // Verifica se já existem categorias para não duplicar dados
  const categoriasExistentes = await db.all('SELECT * FROM categoria');

  if (categoriasExistentes.length === 0) {
    // Inserir categoria padrão usando a coluna corrigida
    const resultCat = await db.run(
      "INSERT INTO categoria (nome_categoria, icone) VALUES ('Pratos Principais', 'plate.png')"
    );
    const catId = resultCat.lastID;

    // Inserir os produtos oficiais do cardápio vinculados à categoria criada
    await db.run(`
      INSERT INTO produto (nome, descricao, preco, disponibilidade, foto, id_categoria_fk) VALUES 
      ('Lámen', 'Macarrão coreano tradicional servido em um caldo quente e apimentado com vegetais frescos e ovo.', 22.50, 1, 'lámen.png', ${catId}),
      ('Buchimgae', 'Tradicional tigela de arroz coberta com um mix de vegetais coloridos, carne marinada e ovo frito.', 36.00, 1, 'buchimgae.png', ${catId}),
      ('Tteokbokki', 'Bolinhos de arroz super macios e mastigáveis, cozidos em um delicioso molho de pimenta doce.', 28.00, 1, 'tteokbokki.png', ${catId})
    `);

    console.log('--- Seeds executadas com sucesso! ---');
  } else {
    console.log('--- O banco já possui dados. Seeds puladas. ---');
  }
}

// Executa automaticamente se o arquivo for chamado direto no terminal
if (import.meta.url === `file://${process.argv[1]}`) {
  rodarSeeds();
}
