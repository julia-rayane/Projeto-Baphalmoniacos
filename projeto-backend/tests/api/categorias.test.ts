import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';
import { autorizacao, criarLimpeza, criarUsuario, sufixo } from '../helpers/db.js';

const limpeza = criarLimpeza();

let admin: Awaited<ReturnType<typeof criarUsuario>>;
let cliente: Awaited<ReturnType<typeof criarUsuario>>;

before(async () => {
  admin = await criarUsuario('admin');
  cliente = await criarUsuario('cliente');
  limpeza.ids.usuarios.push(admin.usuario.id, cliente.usuario.id);
});

after(async () => {
  await limpeza.executar();
});

describe('Categorias', () => {
  it('GET /categorias é público e devolve a lista', async () => {
    const resposta = await request(app).get('/categorias');

    assert.equal(resposta.status, 200);
    assert.ok(Array.isArray(resposta.body));
  });

  it('admin cria (201), renomeia (200) e remove (204); a lista reflete cada passo', async () => {
    const nome = `Categoria ${sufixo()}`;

    const criada = await request(app).post('/categorias').set(autorizacao(admin.token)).send({ nome });
    assert.equal(criada.status, 201);
    assert.equal(criada.body.nome, nome);
    const id = criada.body.id;
    limpeza.ids.categorias.push(id);

    const novoNome = `${nome} (renomeada)`;
    const atualizada = await request(app)
      .put(`/categorias/${id}`)
      .set(autorizacao(admin.token))
      .send({ nome: novoNome });
    assert.equal(atualizada.status, 200);
    assert.equal(atualizada.body.nome, novoNome);

    const listaDepois = await request(app).get('/categorias');
    assert.ok(listaDepois.body.some((c: { id: number; nome: string }) => c.id === id && c.nome === novoNome));

    const removida = await request(app).delete(`/categorias/${id}`).set(autorizacao(admin.token));
    assert.equal(removida.status, 204);

    const listaFinal = await request(app).get('/categorias');
    assert.equal(listaFinal.body.some((c: { id: number }) => c.id === id), false);
  });

  it('sem token → 401 e como cliente → 403 em criação, edição e remoção', async () => {
    const criada = await request(app)
      .post('/categorias')
      .set(autorizacao(admin.token))
      .send({ nome: `Protegida ${sufixo()}` });
    const id = criada.body.id;
    limpeza.ids.categorias.push(id);

    const semToken = [
      await request(app).post('/categorias').send({ nome: 'x' }),
      await request(app).put(`/categorias/${id}`).send({ nome: 'x' }),
      await request(app).delete(`/categorias/${id}`),
    ];
    const comoCliente = [
      await request(app).post('/categorias').set(autorizacao(cliente.token)).send({ nome: 'x' }),
      await request(app).put(`/categorias/${id}`).set(autorizacao(cliente.token)).send({ nome: 'x' }),
      await request(app).delete(`/categorias/${id}`).set(autorizacao(cliente.token)),
    ];

    assert.deepEqual(semToken.map((r) => r.status), [401, 401, 401]);
    assert.deepEqual(comoCliente.map((r) => r.status), [403, 403, 403]);
  });
});
