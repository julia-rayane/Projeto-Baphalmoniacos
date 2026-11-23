import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/database/database.js';
import { MAX_FILE_SIZE, uploadFolder } from '../../src/config/multer.js';
import { PNG_1X1, autorizacao, criarLimpeza, criarUsuario } from '../helpers/db.js';

const limpeza = criarLimpeza();

let dono: Awaited<ReturnType<typeof criarUsuario>>;
let outro: Awaited<ReturnType<typeof criarUsuario>>;

const arquivosNaPasta = () => fs.readdirSync(uploadFolder).length;

before(async () => {
  dono = await criarUsuario();
  outro = await criarUsuario();
  limpeza.ids.usuarios.push(dono.usuario.id, outro.usuario.id);
});

after(async () => {
  await limpeza.executar(); // também apaga do disco as fotos enviadas pelos testes
});

describe('Upload de foto de perfil (/api/users/image)', () => {
  it('sem token → 401 e nada é gravado no disco', async () => {
    const antes = arquivosNaPasta();

    const resposta = await request(app)
      .post('/api/users/image')
      .attach('image', PNG_1X1, { filename: 'avatar.png', contentType: 'image/png' });

    assert.equal(resposta.status, 401);
    assert.equal(arquivosNaPasta(), antes);
  });

  it('tipo não permitido (PDF) → 400 e nada é gravado no disco', async () => {
    const antes = arquivosNaPasta();

    const resposta = await request(app)
      .post('/api/users/image')
      .set(autorizacao(dono.token))
      .attach('image', Buffer.from('%PDF-1.4 conteudo'), { filename: 'doc.pdf', contentType: 'application/pdf' });

    assert.equal(resposta.status, 400);
    assert.deepEqual(resposta.body, { error: 'Tipo de arquivo não permitido. Apenas JPEG, PNG e GIF.' });
    assert.equal(arquivosNaPasta(), antes);
  });

  it('arquivo maior que 2 MB → 400', async () => {
    const resposta = await request(app)
      .post('/api/users/image')
      .set(autorizacao(dono.token))
      .attach('image', Buffer.alloc(MAX_FILE_SIZE + 1), { filename: 'grande.png', contentType: 'image/png' });

    assert.equal(resposta.status, 400);
    assert.deepEqual(resposta.body, { error: 'Arquivo excede o limite máximo de 2MB.' });
  });

  it('arquivo enviado no campo errado → 400', async () => {
    const resposta = await request(app)
      .post('/api/users/image')
      .set(autorizacao(dono.token))
      .attach('foto', PNG_1X1, { filename: 'avatar.png', contentType: 'image/png' });

    assert.equal(resposta.status, 400);
    assert.match(resposta.body.error, /campo "image"/i);
  });

  it('requisição sem arquivo → 400', async () => {
    const resposta = await request(app)
      .post('/api/users/image')
      .set(autorizacao(dono.token))
      .field('observacao', 'sem arquivo');

    assert.equal(resposta.status, 400);
    assert.match(resposta.body.error, /Nenhum arquivo enviado/);
  });

  it('envio válido → 201 com caminho público; depois, PUT troca a foto e apaga a antiga', async () => {
    // POST: primeiro envio
    const primeiro = await request(app)
      .post('/api/users/image')
      .set(autorizacao(dono.token))
      .attach('image', PNG_1X1, { filename: 'avatar.png', contentType: 'image/png' });

    assert.equal(primeiro.status, 201);
    assert.match(primeiro.body.path, /^\/imgs\/profile\/[a-f0-9]{32}\.png$/);

    const servida = await request(app).get(primeiro.body.path);
    assert.equal(servida.status, 200);
    assert.match(servida.headers['content-type'], /image\/png/);

    // PUT: reenvio pelo mesmo usuário
    const segundo = await request(app)
      .put('/api/users/image')
      .set(autorizacao(dono.token))
      .attach('image', PNG_1X1, { filename: 'outra.png', contentType: 'image/png' });

    assert.equal(segundo.status, 200);
    assert.notEqual(segundo.body.path, primeiro.body.path);

    // O arquivo antigo some do disco e o novo continua acessível
    assert.equal((await request(app).get(primeiro.body.path)).status, 404);
    assert.equal((await request(app).get(segundo.body.path)).status, 200);

    // Regra "uma imagem por usuário": continua existindo um único registro, já com o caminho novo
    const registros = await prisma.image.findMany({ where: { usuarioId: dono.usuario.id } });
    assert.equal(registros.length, 1);
    assert.equal(registros[0].path, segundo.body.path);
  });

  it('a foto de um usuário não aparece nos dados de outro', async () => {
    const comoOutro = await request(app).get('/api/users/me').set(autorizacao(outro.token));

    assert.equal(comoOutro.status, 200);
    assert.equal(comoOutro.body.image, null);
  });
});
