import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import SendMail from '../../src/services/SendMail.js';

const CHAVES = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_SECURE'];
let original: Record<string, string | undefined>;

// O transporte do nodemailer é substituído por um dublê: nenhum e-mail sai de verdade
beforeEach(() => {
  original = {};
  for (const chave of CHAVES) original[chave] = process.env[chave];
  Object.assign(process.env, {
    EMAIL_HOST: 'smtp.teste.local',
    EMAIL_USER: 'u',
    EMAIL_PASS: 'p',
  });
  mock.method(console, 'log', () => {});
  mock.method(console, 'error', () => {});
});

afterEach(() => {
  for (const chave of CHAVES) {
    if (original[chave] === undefined) delete process.env[chave];
    else process.env[chave] = original[chave];
  }
  mock.restoreAll();
});

describe('SendMail.createNewUser', () => {
  it('monta a mensagem de boas-vindas para o destinatário informado', async () => {
    const enviar = mock.fn(async (_mensagem: unknown) => ({ messageId: 'id-1', response: '250 OK' }));
    const criarTransporte = mock.method(nodemailer, 'createTransport', () => ({ sendMail: enviar }) as any);

    await SendMail.createNewUser('nova.pessoa@exemplo.com');

    assert.equal(criarTransporte.mock.callCount(), 1);
    assert.equal((criarTransporte.mock.calls[0].arguments[0] as any).host, 'smtp.teste.local');
    assert.equal(enviar.mock.callCount(), 1);

    const mensagem = enviar.mock.calls[0].arguments[0] as Record<string, string>;
    assert.equal(mensagem.to, 'nova.pessoa@exemplo.com');
    assert.equal(mensagem.subject, 'Conta criada no Foods App');
    assert.match(mensagem.text, /Conta criada com sucesso/);
  });

  it('não propaga a falha do envio (o cadastro não pode quebrar por causa do e-mail)', async () => {
    const enviar = mock.fn(async () => {
      throw new Error('SMTP fora do ar');
    });
    mock.method(nodemailer, 'createTransport', () => ({ sendMail: enviar }) as any);

    await assert.doesNotReject(() => SendMail.createNewUser('x@exemplo.com'));
    assert.equal(enviar.mock.callCount(), 1);
  });
});
