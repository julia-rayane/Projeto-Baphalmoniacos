import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpa os dados existentes para não duplicar se rodar duas vezes
  await prisma.produto.deleteMany({});
  await prisma.categoria.deleteMany({});

  // 1. Cria as categorias obrigatórias
  const principal = await prisma.categoria.create({
    data: { id: 1, nome: 'Prato Principal' }
  });

  const Entrada = await prisma.categoria.create({
    data: { id: 2, nome: 'Entrada' }
  });

  // 2. Cria os produtos iniciais (Baphalmoníacos)
  await prisma.produto.createMany({
    data: [
      {
        id: 1,
        nome: 'Lámen Tradicional',
        descricao: 'Macarrão coreano com caldo artesanal e acompanhamentos.',
        preco: 35.00,
        foto: 'lámen.png',
        id_categoria_fk: principal.id
      },
      {
        id: 2,
        nome: 'Tteokbokki',
        descricao: 'Bolinhos de arroz macios em molho picante e adocicado.',
        preco: 28.00,
        foto: 'tteokbokki.png',
        id_categoria_fk: principal.id
      },
      {
        id: 3,
        nome: 'Buchimgae',
        descricao: 'Panqueca coreana com legumes fritos',
        preco: 22.50,
        foto: 'buchimgae.png',
        id_categoria_fk: entrada.id
      }
    ]
  });

  console.log('🌱 Banco de dados alimentado com sucesso pelo Prisma Seed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
