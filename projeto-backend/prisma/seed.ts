import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando alimentação do banco de dados...');

  // 1. Limpa o banco para não duplicar dados
  await prisma.produto.deleteMany({});
  await prisma.categoria.deleteMany({});

  // 2. Cria APENAS a categoria de Prato Principal 
  const categoriaPrincipal = await prisma.categoria.create({
    data: {
      id: 1,
      nome: 'Prato Principal',
    },
  });

  console.log('✅ Categoria base criada com sucesso!');

  // 3. Adiciona os produtos iniciais
  await prisma.produto.create({
    data: {
      nome: 'Tteokbokki',
      descricao: 'Bolinhos de arroz macios e mastigáveis cozidos em um molho de pimenta gochujang doce e picante com fatias de bolo de peixe.',
      preco: 32.00,
      foto: 'tteokbokki.png',
      categoria: {
        connect: { id: 1 }
      }
    },
  });

  await prisma.produto.create({
    data: {
      nome: 'Buchimgae',
      descricao: 'Panqueca coreana frita na chapa, crocante por fora e macia por dentro, recheada com vegetais frescos e cebolinha.',
      preco: 28.50,
      foto: 'buchimgae.png',
      categoria: {
        connect: { id: 1 }
      }
    },
  });

  await prisma.produto.create({
    data: {
      nome: 'Lámen Especial',
      descricao: 'Macarrão artesanal servido em caldo aromático ultra saboroso, acompanhado de fatias de carne macia, ovo marinado perfeitamente cozido e cebolinha fresca.',
      preco: 35.00,
      foto: 'lámen.png', 
      categoria: {
        connect: { id: 1 }
      }
    },
  });

  console.log('✅ Produtos iniciais semeados com sucesso!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🏁 Processo de Seed finalizado com sucesso absoluto!');
  })
  .catch(async (e) => {
    console.error('❌ Erro durante o seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
