import prisma from '../database/database.js';

// 1. CADASTRAR CATEGORIA (CREATE)
async function create(data: { nome: string }) {
  return await prisma.categoria.create({
    data: { nome: data.nome }
  });
}

// 2. LISTAR CATEGORIAS (READ)
async function read() {
  return await prisma.categoria.findMany({
    include: { produtos: true } // Já traz os produtos vinculados 
  });
}

// 3. ATUALIZAR CATEGORIA (UPDATE)
async function update(id: number, data: { nome?: string }) {
  return await prisma.categoria.update({
    where: { id: id },
    data: data
  });
}

// 4. REMOVER CATEGORIA (DELETE)
async function remove(id: number) {
  return await prisma.categoria.delete({
    where: { id: id }
  });
}

export default { create, read, update, remove };
