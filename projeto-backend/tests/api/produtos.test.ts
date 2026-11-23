import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';
import { autorizacao, criarLimpeza, criarUsuario, sufixo } from '../helpers/db.js';

const limpeza = criarLimpeza();

let admin: Awaited<ReturnType<typeof criarUsuario>>;
let cliente: Awaited<ReturnType<typeof criarUsuario>>;
let categoriaId: number;

const novoProduto = (extra: Record<string, unknown> = {}) => ({
  nome: `Prato ${sufixo()}`,
  descricao: 'Descrição de teste',
  preco: 32.5,
  foto: 'default.png',
  id_categoria_fk: categoriaId,
  ...extra,
});

async function criarProdutoComoAdmin(extra: Record<string, unknown> = {}) {
  const resposta = await request(app).post('/produtos').set(autorizacao(admin.token)).send(novoProduto(extra));
  if (resposta.body?.id) limpeza.ids.produtos.push(resposta.body.id);
  return resposta;
}

before(async () => {
  admin = await criarUsuario('admin');
  cliente = await criarUsuario('cliente');
  limpeza.ids.usuarios.push(admin.usuario.id, cliente.usuario.id);

  const categoria = await request(app)
    .post('/categorias')
    .set(autorizacao(admin.token))
    .send({ nome: `Categoria ${sufixo()}` });
  categoriaId = categoria.body.id;
  limpeza.ids.categorias.push(categoriaId);
});

after(async () => {
  await limpeza.executar();
});

describe('Produtos — leitura pública', () => {
  it('GET /produtos lista sem exigir login', async () => {
    const resposta = await request(app).get('/produtos');

    assert.equal(resposta.status, 200);
    assert.ok(Array.isArray(resposta.body));
  });

  it('GET /produtos?nome= filtra pelo trecho do nome', async () => {
    const trecho = `Filtro${sufixo()}`;
    const criado = await criarProdutoComoAdmin({ nome: `${trecho} especial` });

    const resposta = await request(app).get('/produtos').query({ nome: trecho });

    assert.equal(resposta.status, 200);
    assert.deepEqual(
      resposta.body.map((p: { id: number }) => p.id),
      [criado.body.id],
    );
  });

  it('GET /produtos/:id devolve 404 para produto inexistente', async () => {
    const resposta = await request(app).get('/produtos/999999999');

    assert.equal(resposta.status, 404);
    assert.deepEqual(resposta.body, { erro: 'Produto não encontrado' });
  });
});

describe('Produtos — CRUD como administrador', () => {
  it('cria (201), consulta, atualiza (200) e remove (204) um produto', async () => {
    // CREATE
    const criado = await criarProdutoComoAdmin({ nome: `Ciclo ${sufixo()}`, preco: 20 });
    assert.equal(criado.status, 201);
    assert.equal(criado.body.preco, 20);
    const id = criado.body.id;

    // READ
    const lido = await request(app).get(`/produtos/${id}`);
    assert.equal(lido.status, 200);
    assert.equal(lido.body.nome, criado.body.nome);

    // UPDATE
    const atualizado = await request(app)
      .put(`/produtos/${id}`)
      .set(autorizacao(admin.token))
      .send({ preco: 45.9 });
    assert.equal(atualizado.status, 200);
    assert.equal(atualizado.body.preco, 45.9);
    assert.equal(atualizado.body.nome, criado.body.nome, 'campos não enviados permanecem iguais');

    // DELETE
    const removido = await request(app).delete(`/produtos/${id}`).set(autorizacao(admin.token));
    assert.equal(removido.status, 204);

    const depois = await request(app).get(`/produtos/${id}`);
    assert.equal(depois.status, 404);
  });

  it('aplica valores padrão (descrição e foto) quando não são enviados', async () => {
    const resposta = await request(app)
      .post('/produtos')
      .set(autorizacao(admin.token))
      .send({ nome: `Padrão ${sufixo()}`, preco: 10, id_categoria_fk: categoriaId });
    if (resposta.body?.id) limpeza.ids.produtos.push(resposta.body.id);

    assert.equal(resposta.status, 201);
    assert.equal(resposta.body.descricao, 'Sem descrição');
    assert.equal(resposta.body.foto, 'default.png');
  });
});

describe('Produtos — autenticação e autorização', () => {
  it('POST sem token → 401', async () => {
    const resposta = await request(app).post('/produtos').send(novoProduto());

    assert.equal(resposta.status, 401);
    assert.deepEqual(resposta.body, { error: 'Token não fornecido.' });
  });

  it('POST com token de cliente → 403 (só admin cria produto)', async () => {
    const resposta = await request(app).post('/produtos').set(autorizacao(cliente.token)).send(novoProduto());

    assert.equal(resposta.status, 403);
    assert.deepEqual(resposta.body, { error: 'Acesso restrito a administradores.' });
  });

  it('PUT e DELETE sem token → 401, e cliente → 403, sem alterar o produto', async () => {
    const criado = await criarProdutoComoAdmin({ preco: 15 });
    const id = criado.body.id;

    const semTokenPut = await request(app).put(`/produtos/${id}`).send({ preco: 1 });
    const clientePut = await request(app).put(`/produtos/${id}`).set(autorizacao(cliente.token)).send({ preco: 1 });
    const semTokenDelete = await request(app).delete(`/produtos/${id}`);
    const clienteDelete = await request(app).delete(`/produtos/${id}`).set(autorizacao(cliente.token));

    assert.equal(semTokenPut.status, 401);
    assert.equal(clientePut.status, 403);
    assert.equal(semTokenDelete.status, 401);
    assert.equal(clienteDelete.status, 403);

    const intacto = await request(app).get(`/produtos/${id}`);
    assert.equal(intacto.status, 200);
    assert.equal(intacto.body.preco, 15);
  });
});
