import prisma from '../database/database.js';

// 1. LISTAR PRODUTOS (Com o filtro "contains")
async function read(where?: { nome?: string }) {
  if (where?.nome) {
    return await prisma.produto.findMany({
      where: {
        nome: {
          contains: where.nome
        }
      }
    });
  }
  return await prisma.produto.findMany();
}

// 2. BUSCAR PRODUTO POR ID
async function findById(id: number) {
  return await prisma.produto.findUnique({
    where: { id: id }
  });
}

// 3. ADICIONAR UM NOVO PRODUTO (CREATE) - CORRIGIDO PARA O PRISMA
async function create(data: any) {
  return await prisma.produto.create({
    data: {
      nome: data.nome,
      descricao: data.descricao,
      preco: Number(data.preco),
      foto: data.foto,
      categoria: {
        connect: { id: Number(data.id_categoria_fk) }
      }
    }
  });
}

// 4. ATUALIZAR UM PRODUTO (UPDATE) - CORRIGIDO PARA O PRISMA
async function update(id: number, data: any) {
  const updateData: any = {
    nome: data.nome,
    descricao: data.descricao,
    preco: data.preco ? Number(data.preco) : undefined,
    foto: data.foto,
  };

  if (data.id_categoria_fk) {
    updateData.categoria = {
      connect: { id: Number(data.id_categoria_fk) }
    };
  }

  return await prisma.produto.update({
    where: { id: id },
    data: updateData
  });
}

// 5. REMOVER UM PRODUTO (DELETE)
async function remove(id: number) {
  return await prisma.produto.delete({
    where: { id: id }
  });
}

export default { read, findById, create, update, remove };
