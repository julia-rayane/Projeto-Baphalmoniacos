import { describe, it, before, after, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/database/database.js';
import SendMail from '../../src/services/SendMail.js';
import { JWT_SECRET } from '../../src/config/auth.js';
import { autorizacao, criarLimpeza, criarUsuario, emailUnico } from '../helpers/db.js';

const limpeza = criarLimpeza();

// Em TODOS os testes o envio de e-mail é substituído: nenhum e-mail real é enviado
let envioDeEmail: ReturnType<typeof mock.method>;

beforeEach(() => {
  envioDeEmail = mock.method(SendMail, 'createNewUser', async () => undefined);
});

afterEach(() => {
  mock.restoreAll();
});

after(async () => {
  await limpeza.executar();
});

// Cadastra pela API e registra o id para a limpeza final
async function cadastrar(corpo: Record<string, unknown>) {
  const resposta = await request(app).post('/signup').send(corpo);
  if (resposta.body?.id) limpeza.ids.usuarios.push(resposta.body.id);
  return resposta;
}

describe('POST /signup', () => {
  it('cria o usuário (201), devolve só dados públicos e envia o e-mail de boas-vindas', async () => {
    const email = emailUnico('novo');

    const resposta = await cadastrar({ nome: 'Ana Souza', email, senha: 'senha123' });

    assert.equal(resposta.status, 201);
    assert.deepEqual(Object.keys(resposta.body).sort(), ['email', 'id', 'nome', 'role']);
    assert.equal(resposta.body.role, 'cliente');
    assert.equal(envioDeEmail.mock.callCount(), 1);
    assert.equal(envioDeEmail.mock.calls[0].arguments[0], email);
  });

  it('guarda a senha somente como hash bcrypt', async () => {
    const email = emailUnico('hash');
    await cadastrar({ nome: 'Hash', email, senha: 'senha123' });

    const gravado = await prisma.usuario.findUnique({ where: { email } });

    assert.ok(gravado);
    assert.notEqual(gravado.senha, 'senha123');
    assert.match(gravado.senha, /^\$2[aby]\$/);
  });

  it('ignora tentativa de se cadastrar como admin enviando "role" no corpo', async () => {
    const resposta = await cadastrar({
      nome: 'Espertinho',
      email: emailUnico('esperto'),
      senha: 'senha123',
      role: 'admin',
    });

    assert.equal(resposta.status, 201);
    assert.equal(resposta.body.role, 'cliente');
  });

  it('continua criando a conta (201) mesmo se o envio do e-mail falhar', async () => {
    mock.method(console, 'error', () => {});
    envioDeEmail.mock.restore();
    mock.method(SendMail, 'createNewUser', async () => {
      throw new Error('SMTP fora do ar');
    });

    const resposta = await cadastrar({ nome: 'Sem Email', email: emailUnico('sememail'), senha: 'senha123' });

    assert.equal(resposta.status, 201);
  });

  describe('dados inválidos (400)', () => {
    const casos: [string, Record<string, unknown>, string][] = [
      ['nome vazio', { nome: '', email: 'a@teste.local', senha: 'senha123' }, 'nome'],
      ['e-mail inválido', { nome: 'Ana', email: 'sem-arroba', senha: 'senha123' }, 'email'],
      ['senha curta', { nome: 'Ana', email: 'a@teste.local', senha: '123' }, 'senha'],
      ['corpo vazio', {}, 'nome'],
    ];

    for (const [descricao, corpo, campo] of casos) {
      it(`rejeita ${descricao} e aponta o campo "${campo}"`, async () => {
        const resposta = await cadastrar(corpo);

        assert.equal(resposta.status, 400);
        assert.equal(resposta.body.error, 'Dados de entrada inválidos.');
        assert.ok(resposta.body.issues.some((i: { path: string }) => i.path === campo));
        assert.equal(envioDeEmail.mock.callCount(), 0);
      });
    }
  });

  it('rejeita e-mail já cadastrado com 409 e não envia um segundo e-mail', async () => {
    const dados = { nome: 'Duplicado', email: emailUnico('dup'), senha: 'senha123' };
    await cadastrar(dados);

    const segunda = await cadastrar(dados);

    assert.equal(segunda.status, 409);
    assert.deepEqual(segunda.body, { error: 'E-mail já cadastrado.' });
    assert.equal(envioDeEmail.mock.callCount(), 1);
  });
});

describe('POST /signin', () => {
  let email: string;
  let senha: string;

  // O usuário é criado direto no banco: assim este bloco não depende do fluxo de cadastro
  // (nem do envio de e-mail) para testar o login.
  before(async () => {
    const criado = await criarUsuario();
    limpeza.ids.usuarios.push(criado.usuario.id);
    email = criado.usuario.email;
    senha = criado.senha;
  });

  it('devolve token JWT e dados do usuário com credenciais corretas', async () => {
    const resposta = await request(app).post('/signin').send({ email, senha });

    assert.equal(resposta.status, 200);
    assert.equal(resposta.body.usuario.email, email);
    assert.equal(resposta.body.usuario.role, 'cliente');
    assert.equal(resposta.body.usuario.senha, undefined, 'a senha nunca pode voltar na resposta');

    const dados = jwt.verify(resposta.body.token, JWT_SECRET) as { email: string; role: string };
    assert.equal(dados.email, email);
    assert.equal(dados.role, 'cliente');
  });

  it('responde 401 com senha errada', async () => {
    const resposta = await request(app).post('/signin').send({ email, senha: 'senha-errada' });

    assert.equal(resposta.status, 401);
    assert.deepEqual(resposta.body, { error: 'Credenciais inválidas.' });
  });

  it('responde 401 com e-mail inexistente, com a mesma mensagem (não revela quais e-mails existem)', async () => {
    const resposta = await request(app).post('/signin').send({ email: emailUnico('fantasma'), senha });

    assert.equal(resposta.status, 401);
    assert.deepEqual(resposta.body, { error: 'Credenciais inválidas.' });
  });
});

describe('GET /users/me (dados do próprio usuário)', () => {
  it('responde 401 sem token', async () => {
    const resposta = await request(app).get('/users/me');

    assert.equal(resposta.status, 401);
    assert.deepEqual(resposta.body, { error: 'Token não fornecido.' });
  });

  it('responde 401 com token inválido', async () => {
    const resposta = await request(app).get('/users/me').set(autorizacao('token-forjado'));

    assert.equal(resposta.status, 401);
  });

  it('um usuário só enxerga os próprios dados, nunca os de outro (isolamento)', async () => {
    const a = await criarUsuario();
    const b = await criarUsuario();
    limpeza.ids.usuarios.push(a.usuario.id, b.usuario.id);

    const comoA = await request(app).get('/users/me').set(autorizacao(a.token));
    const comoB = await request(app).get('/api/users/me').set(autorizacao(b.token));

    assert.equal(comoA.status, 200);
    assert.equal(comoA.body.email, a.usuario.email);
    assert.equal(comoB.status, 200);
    assert.equal(comoB.body.email, b.usuario.email);
    assert.notEqual(comoA.body.id, comoB.body.id);
    assert.equal(comoA.body.senha, undefined);
  });

  it('responde 404 quando o token é válido mas o usuário já não existe', async () => {
    const { usuario, token } = await criarUsuario();
    await prisma.usuario.delete({ where: { id: usuario.id } });

    const resposta = await request(app).get('/users/me').set(autorizacao(token));

    assert.equal(resposta.status, 404);
    assert.deepEqual(resposta.body, { error: 'Usuário não encontrado.' });
  });
});
