import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import multerConfig, { MAX_FILE_SIZE } from '../../src/config/multer.js';

// Chama o fileFilter do jeito que o Multer chama, só que sem servidor nem arquivo real
function filtrar(mimetype: string) {
  return new Promise<{ erro: Error | null; aceito?: boolean }>((resolve) => {
    (multerConfig.fileFilter as any)({}, { mimetype }, (erro: Error | null, aceito?: boolean) =>
      resolve({ erro, aceito }),
    );
  });
}

// O Multer guarda a função "filename" do diskStorage em storage.getFilename
function gerarNome(mimetype: string, originalname = 'qualquer.png') {
  return new Promise<string>((resolve, reject) => {
    (multerConfig.storage as any).getFilename(
      {},
      { mimetype, originalname },
      (erro: Error | null, nome: string) => (erro ? reject(erro) : resolve(nome)),
    );
  });
}

describe('config/multer (regras de upload)', () => {
  describe('limite de tamanho', () => {
    it('é de exatamente 2 MB', () => {
      assert.equal(MAX_FILE_SIZE, 2 * 1024 * 1024);
      assert.equal(multerConfig.limits?.fileSize, MAX_FILE_SIZE);
    });
  });

  describe('fileFilter (tipos permitidos)', () => {
    for (const tipo of ['image/jpeg', 'image/png', 'image/gif']) {
      it(`aceita ${tipo}`, async () => {
        const { erro, aceito } = await filtrar(tipo);
        assert.equal(erro, null);
        assert.equal(aceito, true);
      });
    }

    for (const tipo of ['application/pdf', 'image/svg+xml', 'text/html', 'image/webp', '']) {
      it(`rejeita "${tipo || '(vazio)'}" com INVALID_FILE_TYPE`, async () => {
        const { erro } = await filtrar(tipo);
        assert.ok(erro instanceof Error);
        assert.equal(erro.message, 'INVALID_FILE_TYPE');
      });
    }
  });

  describe('nome do arquivo gravado', () => {
    it('é um hash de 32 caracteres + extensão derivada do tipo MIME', async () => {
      assert.match(await gerarNome('image/png'), /^[a-f0-9]{32}\.png$/);
      assert.match(await gerarNome('image/jpeg'), /^[a-f0-9]{32}\.jpg$/);
      assert.match(await gerarNome('image/gif'), /^[a-f0-9]{32}\.gif$/);
    });

    it('ignora o nome enviado pelo cliente (evita path traversal)', async () => {
      const nome = await gerarNome('image/png', '../../etc/passwd.exe');
      assert.doesNotMatch(nome, /[\\/]|\.\./);
      assert.doesNotMatch(nome, /passwd|exe/);
    });

    it('gera nomes diferentes a cada chamada (evita sobrescrita)', async () => {
      const [a, b] = await Promise.all([gerarNome('image/png'), gerarNome('image/png')]);
      assert.notEqual(a, b);
    });
  });
});
