import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { criarStorageFalso, respostaFalsa } from './helpers.js';

// A página real (perfil.html) é carregada no JSDOM, então os testes usam os mesmos ids do site
const html = readFileSync(path.resolve(process.cwd(), 'public/perfil.html'), 'utf8');

function montarPagina() {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script').forEach((s) => s.remove());
  document.body.innerHTML = doc.body.innerHTML;
}

const $ = (seletor) => document.querySelector(seletor);

function escolherArquivo(arquivo) {
  const input = $('#image');
  Object.defineProperty(input, 'files', { value: arquivo ? [arquivo] : [], configurable: true });
  input.dispatchEvent(new Event('change'));
}

function enviarFormulario() {
  $('#formUploadAvatar').dispatchEvent(new Event('submit', { cancelable: true }));
}

const imagemValida = () => new File(['x'], 'foto.png', { type: 'image/png' });

describe('profile.js (tela de perfil)', () => {
  let fetchMock;
  let storage;
  let localizacao;

  // profile.js executa ao ser importado, então cada teste importa uma cópia nova do módulo
  async function abrirPagina({ token = 'abc', perfil } = {}) {
    storage = criarStorageFalso(token ? { token } : {});
    vi.stubGlobal('localStorage', storage);
    if (perfil) fetchMock.mockResolvedValueOnce(perfil);

    vi.resetModules();
    await import('../../public/js/profile.js');
  }

  beforeEach(() => {
    montarPagina();
    fetchMock = vi.fn();
    localizacao = { href: 'http://localhost/perfil.html' };
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('location', localizacao);
    vi.stubGlobal('alert', vi.fn());
    URL.createObjectURL = vi.fn(() => 'blob:previa');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
    delete window.atualizarAvatarCabecalho;
    document.body.innerHTML = '';
  });

  describe('acesso', () => {
    it('sem token: avisa, redireciona para o login e não chama a API', async () => {
      await abrirPagina({ token: null });

      expect(alert).toHaveBeenCalledWith(expect.stringContaining('fazer login'));
      expect(localizacao.href).toBe('login.html');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('botão "Sair" avisa e encerra a sessão', async () => {
      await abrirPagina({ token: null });
      alert.mockClear();

      $('#btn-sair').click();

      expect(alert).toHaveBeenCalledWith('Você saiu da sua conta.');
      expect(storage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('carregamento do perfil', () => {
    it('mostra nome, e-mail e a imagem padrão quando o usuário não tem foto', async () => {
      await abrirPagina({
        perfil: respostaFalsa({ corpo: { nome: 'Ana', email: 'ana@x.com', image: null } }),
      });

      await vi.waitFor(() => expect($('#perfil-nome').textContent).toBe('Ana'));
      expect($('#perfil-email').textContent).toBe('ana@x.com');
      expect($('#avatar-preview').getAttribute('src')).toBe('/imgs/avatar-padrao.svg');
      expect(fetchMock).toHaveBeenCalledWith('/api/users/me', expect.objectContaining({ method: 'GET' }));
    });

    it('mostra a foto salva e o primeiro envio seguinte usa PUT', async () => {
      await abrirPagina({
        perfil: respostaFalsa({
          corpo: { nome: 'Ana', email: 'ana@x.com', image: { path: '/imgs/profile/antiga.png' } },
        }),
      });
      await vi.waitFor(() => expect($('#avatar-preview').getAttribute('src')).toBe('/imgs/profile/antiga.png'));

      fetchMock.mockResolvedValueOnce(respostaFalsa({ corpo: { id: 1, path: '/imgs/profile/nova.png' } }));
      escolherArquivo(imagemValida());
      enviarFormulario();

      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      expect(fetchMock.mock.calls[1][1].method).toBe('PUT');
    });

    it('erro ao carregar: mostra a mensagem do servidor', async () => {
      await abrirPagina({
        perfil: respostaFalsa({ status: 500, corpo: { error: 'Erro interno ao buscar o usuário.' } }),
      });

      await vi.waitFor(() => expect($('#msg-avatar').textContent).toBe('Erro interno ao buscar o usuário.'));
    });
  });

  describe('escolha do arquivo (validação no navegador)', () => {
    beforeEach(async () => {
      await abrirPagina({ perfil: respostaFalsa({ corpo: { nome: 'Ana', email: 'ana@x.com', image: null } }) });
      await vi.waitFor(() => expect($('#perfil-nome').textContent).toBe('Ana'));
    });

    it('arquivo válido: mostra pré-visualização e habilita o botão', () => {
      escolherArquivo(imagemValida());

      expect($('#avatar-preview').getAttribute('src')).toBe('blob:previa');
      expect($('#preview-legenda').textContent).toBe('Pré-visualização (ainda não enviada)');
      expect($('#btn-enviar').disabled).toBe(false);
    });

    it('tipo não permitido (PDF): mostra o erro e mantém o botão desabilitado', () => {
      escolherArquivo(new File(['x'], 'doc.pdf', { type: 'application/pdf' }));

      expect($('#msg-avatar').textContent).toContain('Tipo não permitido (application/pdf)');
      expect($('#btn-enviar').disabled).toBe(true);
    });

    it('arquivo acima de 2 MB: mostra o tamanho e o limite', () => {
      const grande = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' });

      escolherArquivo(grande);

      expect($('#msg-avatar').textContent).toContain('Arquivo muito grande (2.0 MB). O limite é 2 MB.');
      expect($('#btn-enviar').disabled).toBe(true);
    });

    it('arquivo de exatamente 2 MB é aceito (limite)', () => {
      const limite = new File([new Uint8Array(2 * 1024 * 1024)], 'limite.png', { type: 'image/png' });

      escolherArquivo(limite);

      expect($('#btn-enviar').disabled).toBe(false);
    });

    it('limpar a seleção volta para a imagem padrão e desabilita o botão', () => {
      escolherArquivo(imagemValida());
      escolherArquivo(null);

      expect($('#avatar-preview').getAttribute('src')).toBe('/imgs/avatar-padrao.svg');
      expect($('#btn-enviar').disabled).toBe(true);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:previa');
    });
  });

  describe('envio da foto', () => {
    beforeEach(async () => {
      await abrirPagina({ perfil: respostaFalsa({ corpo: { nome: 'Ana', email: 'ana@x.com', image: null } }) });
      await vi.waitFor(() => expect($('#perfil-nome').textContent).toBe('Ana'));
    });

    it('sem arquivo selecionado: pede para selecionar e não chama a API', () => {
      enviarFormulario();

      expect($('#msg-avatar').textContent).toBe('Selecione uma imagem.');
      expect(fetchMock).toHaveBeenCalledTimes(1); // só a chamada inicial de /users/me
    });

    it('sucesso: POST com FormData e token, atualiza a tela e passa a usar PUT', async () => {
      window.atualizarAvatarCabecalho = vi.fn();
      fetchMock.mockResolvedValueOnce(
        respostaFalsa({ status: 201, corpo: { id: 1, path: '/imgs/profile/nova.png' } }),
      );

      escolherArquivo(imagemValida());
      enviarFormulario();

      await vi.waitFor(() => expect($('#msg-avatar').textContent).toBe('Foto atualizada com sucesso!'));

      const [url, opcoes] = fetchMock.mock.calls[1];
      expect(url).toBe('/api/users/image');
      expect(opcoes.method).toBe('POST');
      expect(opcoes.body).toBeInstanceOf(FormData);
      expect(opcoes.headers).toEqual({ Authorization: 'Bearer abc' });

      expect($('#avatar-preview').getAttribute('src')).toBe('/imgs/profile/nova.png');
      expect(window.atualizarAvatarCabecalho).toHaveBeenCalledWith('/imgs/profile/nova.png');
      expect($('#btn-enviar').disabled).toBe(true);

      // próximo envio é atualização
      fetchMock.mockResolvedValueOnce(respostaFalsa({ corpo: { id: 1, path: '/imgs/profile/outra.png' } }));
      escolherArquivo(imagemValida());
      enviarFormulario();

      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
      expect(fetchMock.mock.calls[2][1].method).toBe('PUT');
    });

    it('erro do servidor (400): mostra a mensagem e reabilita o botão', async () => {
      fetchMock.mockResolvedValueOnce(
        respostaFalsa({ status: 400, corpo: { error: 'Arquivo excede o limite máximo de 2MB.' } }),
      );

      escolherArquivo(imagemValida());
      enviarFormulario();

      await vi.waitFor(() => expect($('#msg-avatar').textContent).toBe('Arquivo excede o limite máximo de 2MB.'));
      expect($('#btn-enviar').disabled).toBe(false);
    });

    it('erro do servidor sem mensagem: usa o texto padrão', async () => {
      fetchMock.mockResolvedValueOnce(respostaFalsa({ status: 500, corpo: {} }));

      escolherArquivo(imagemValida());
      enviarFormulario();

      await vi.waitFor(() => expect($('#msg-avatar').textContent).toBe('Erro ao enviar a imagem.'));
    });

    it('falha de rede: avisa erro de conexão e reabilita o botão', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      escolherArquivo(imagemValida());
      enviarFormulario();

      await vi.waitFor(() => expect($('#msg-avatar').textContent).toBe('Erro de conexão com o servidor.'));
      expect($('#btn-enviar').disabled).toBe(false);
    });
  });
});
