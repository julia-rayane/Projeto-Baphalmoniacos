import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';

describe('Rotas inexistentes', () => {
  it('GET em rota desconhecida responde 404', async () => {
    const resposta = await request(app).get('/api/rota-que-nao-existe');

    assert.equal(resposta.status, 404);
  });

  it('método não suportado em rota conhecida também responde 404', async () => {
    const resposta = await request(app).patch('/produtos/1');

    assert.equal(resposta.status, 404);
  });
});
