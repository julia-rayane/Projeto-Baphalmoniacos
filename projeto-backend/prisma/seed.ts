import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando alimentação do banco de dados...');

  // 1. Limpa o banco para não duplicar dados
  await prisma.produto.deleteMany({});
  await prisma.categoria.deleteMany({});
  await prisma.usuario.deleteMany({});

  // 1.1 Cria o usuário admin inicial (único jeito de existir um admin no sistema)
  const senhaAdminHash = await bcrypt.hash('admin123', 10);
  await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@baphalmoniacos.com',
      senha: senhaAdminHash,
      role: 'admin',
    },
  });
  console.log('✅ Usuário admin criado! Login: admin@baphalmoniacos.com | Senha: admin123');

  // 2. Cria as categorias
  await prisma.categoria.create({
    data: { id: 1, nome: 'Prato Principal' },
  });

  await prisma.categoria.create({
    data: { id: 2, nome: 'Bebidas' },
  });

  await prisma.categoria.create({
    data: { id: 3, nome: 'Doces' },
  });

  console.log('✅ Categorias criadas com sucesso!');

  // 3. Pratos principais (categoria 1)
  await prisma.produto.create({
    data: {
      nome: 'Tteokbokki',
      descricao: 'Bolinhos de arroz macios e mastigáveis cozidos em um molho de pimenta gochujang doce e picante, com fatias de bolo de peixe.',
      preco: 32.00,
      foto: 'tteokbokki.png',
      categoria: { connect: { id: 1 } }
    },
  });

  await prisma.produto.create({
    data: {
      nome: 'Buchimgae',
      descricao: 'Panqueca coreana frita na chapa, crocante por fora e macia por dentro, feita com cebolinha, vegetais frescos e frutos do mar. Acompanha molho para mergulhar.',
      preco: 28.50,
      foto: 'buchimgae.png',
      categoria: { connect: { id: 1 } }
    },
  });

  await prisma.produto.create({
    data: {
      nome: 'Ramyeon (Lámen Coreano)',
      descricao: 'Macarrão em caldo vermelho e picante, servido com fatias de frango, kimchi, cogumelos enoki, ovo e cebolinha.',
      preco: 35.00,
      foto: 'ramyeon.jpg',
      categoria: { connect: { id: 1 } }
    },
  });

  // 4. Bebidas (categoria 2)
  await prisma.produto.create({
    data: {
      nome: 'Leite de Banana Coreano (Banana Uyu)',
      descricao: 'Bebida láctea de banana, cremosa e de sabor doce e nostálgico, famosa por aparecer em doramas. Ideal para tomar bem gelada, acompanhar lanches ou deixar o café gelado ainda mais especial.',
      preco: 17.50,
      foto: 'banana-uyu.jpeg',
      categoria: { connect: { id: 2 } }
    },
  });

  await prisma.produto.create({
    data: {
      nome: 'Refrigerante Sabor Melancia',
      descricao: 'Refrigerante gaseificado sabor melancia, refrescante e ideal para tomar bem gelado. Sucesso coreano, não contém glúten. Vem em lata de 350 ml.',
      preco: 13.49,
      foto: 'refrigerante-melancia.jpeg',
      categoria: { connect: { id: 2 } }
    },
  });

  await prisma.produto.create({
    data: {
      nome: 'Chá de Ginseng Coreano (Panax Ginseng)',
      descricao: 'Chá solúvel feito com extrato da raiz de ginseng coreano (Panax ginseng), de sabor suave e levemente adocicado. Não contém glúten. Caixa com 50 sachês (150 g).',
      preco: 71.80,
      foto: 'cha-ginseng.jpeg',
      categoria: { connect: { id: 2 } }
    },
  });

  // 5. Doces (categoria 3)
  await prisma.produto.create({
    data: {
      nome: 'Choco Pie Lotte',
      descricao: 'Bolinho macio no estilo alfajor, com recheio de marshmallow e cobertura de chocolate ao leite, muito popular entre os fãs de doramas. Edição Lotte Cacau, em caixa com 6 unidades (168 g).',
      preco: 19.50,
      foto: 'choco-pie.jpeg',
      categoria: { connect: { id: 3 } }
    },
  });

  await prisma.produto.create({
    data: {
      nome: 'Pepero Original',
      descricao: 'Biscoito doce em formato de palito, coberto com chocolate ao leite, produzido pela Lotte na Coreia do Sul desde 1983. Ótimo para acompanhar um café ou dividir com amigos. Embalagem de 47 g.',
      preco: 19.16,
      foto: 'pepero.jpeg',
      categoria: { connect: { id: 3 } }
    },
  });

  await prisma.produto.create({
    data: {
      nome: 'Bala de Café Kopiko',
      descricao: 'Bala dura com sabor de café, feita com extrato de café e popularizada em doramas coreanos. Produto importado, fabricado na Indonésia. Cartela com 8 unidades (32 g).',
      preco: 14.80,
      foto: 'kopiko.jpeg',
      categoria: { connect: { id: 3 } }
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
