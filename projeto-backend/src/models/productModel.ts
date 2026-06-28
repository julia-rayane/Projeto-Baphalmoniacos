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

// 3. ADICIONAR UM NOVO PRODUTO (CREATE)
async function create(data: any) {
  return await prisma.produto.create({
    data: {
      nome: data.nome,
      descricao: data.descricao,
      preco: Number(data.preco), // O Prisma exige a conversão exata para número flutuante
      foto: data.foto,
      id_categoria_fk: data.id_categoria_fk ? Number(data.id_categoria_fk) : null // Converte para número inteiro
    }
  });
}

// 4. ATUALIZAR UM PRODUTO (UPDATE)
async function update(id: number, data: any) {
  return await prisma.produto.update({
    where: { id: id },
    data: {
      ...data,
      preco: data.preco ? Number(data.preco) : undefined,
      id_categoria_fk: data.id_categoria_fk ? Number(data.id_categoria_fk) : undefined
    }
  });
}

// 5. REMOVER UM PRODUTO (DELETE)
async function remove(id: number) {
  return await prisma.produto.delete({
    where: { id: id }
  });
}

export default { read, findById, create, update, remove };
