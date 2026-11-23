import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import API from '../../public/js/services/api.js';
import { criarStorageFalso, respostaFalsa } from './helpers.js';

// Módulo que fala com a API: fetch e localStorage são substituídos por dublês,
// então nenhuma requisição real acontece.
describe('services/api.js', () => {
  let fetchMock;
  let storage;
  let localizacao;

  beforeEach(() => {
    fetchMock = vi.fn();
    storage = criarStorageFalso({ token: 'abc.def.ghi', role: 'cliente' });
    localizacao = { href: 'http://localhost/perfil.html' };
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('location', localizacao);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('read (GET autenticado)', () => {
    it('chama a URL com prefixo /api, método GET e cabeçalho Authorization Bearer', async () => {
      fetchMock.mockResolvedValue(respostaFalsa({ corpo: { nome: 'Ana' } }));

      await API.read('/users/me');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith('/api/users/me', {
        method: 'GET',
        headers: { Authorization: 'Bearer abc.def.ghi' },
      });
    });

    it('sucesso: devolve ok, status e os dados convertidos de JSON', async () => {
      fetchMock.mockResolvedValue(respostaFalsa({ status: 200, corpo: { nome: 'Ana', email: 'ana@x.com' } }));

      const resultado = await API.read('/users/me');

      expect(resultado).toEqual({ ok: true, status: 200, data: { nome: 'Ana', email: 'ana@x.com' } });
      expect(storage.removeItem).not.toHaveBeenCalled();
    });

    it('erro 404: devolve ok=false com a mensagem do servidor, sem deslogar', async () => {
      fetchMock.mockResolvedValue(respostaFalsa({ status: 404, corpo: { error: 'Usuário não encontrado.' } }));

      const resultado = await API.read('/users/me');

      expect(resultado).toEqual({ ok: false, status: 404, data: { error: 'Usuário não encontrado.' } });
      expect(storage.removeItem).not.toHaveBeenCalled();
      expect(localizacao.href).toBe('http://localhost/perfil.html');
    });

    it('erro 401: apaga a sessão (token e role) e manda para o login', async () => {
      fetchMock.mockResolvedValue(respostaFalsa({ status: 401, corpo: { error: 'Token inválido ou expirado.' } }));

      const resultado = await API.read('/users/me');

      expect(resultado.status).toBe(401);
      expect(storage.removeItem).toHaveBeenCalledWith('token');
      expect(storage.removeItem).toHaveBeenCalledWith('role');
      expect(localizacao.href).toBe('login.html');
    });

    it('resposta que não é JSON (ex.: página de erro em HTML) vira data = {}', async () => {
      fetchMock.mockResolvedValue(respostaFalsa({ status: 502, jsonInvalido: true }));

      const resultado = await API.read('/users/me');

      expect(resultado).toEqual({ ok: false, status: 502, data: {} });
    });

    it('sem token salvo, envia "Bearer null" (o servidor responde 401 e o front faz signout)', async () => {
      vi.stubGlobal('localStorage', criarStorageFalso());
      fetchMock.mockResolvedValue(respostaFalsa({ status: 401, corpo: { error: 'Token inválido ou expirado.' } }));

      await API.read('/users/me');

      expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer null' });
    });

    it('falha de rede: a promessa é rejeitada para quem chamou tratar', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(API.read('/users/me')).rejects.toThrow('Failed to fetch');
    });
  });

  describe('sendFile (envio multipart)', () => {
    function criarFormData() {
      const formData = new FormData();
      formData.append('image', new File(['conteudo'], 'avatar.png', { type: 'image/png' }));
      return formData;
    }

    it.each(['POST', 'PUT'])('usa o método %s, a URL /api e o mesmo FormData recebido', async (metodo) => {
      fetchMock.mockResolvedValue(respostaFalsa({ status: 201, corpo: { id: 1, path: '/imgs/profile/x.png' } }));
      const formData = criarFormData();

      await API.sendFile(metodo, '/users/image', formData);

      const [url, opcoes] = fetchMock.mock.calls[0];
      expect(url).toBe('/api/users/image');
      expect(opcoes.method).toBe(metodo);
      expect(opcoes.body).toBe(formData);
      expect(opcoes.headers).toEqual({ Authorization: 'Bearer abc.def.ghi' });
    });

    it('NÃO define Content-Type (o navegador precisa gerar o boundary do multipart)', async () => {
      fetchMock.mockResolvedValue(respostaFalsa({ status: 201 }));

      await API.sendFile('POST', '/users/image', criarFormData());

      const cabecalhos = Object.keys(fetchMock.mock.calls[0][1].headers).map((c) => c.toLowerCase());
      expect(cabecalhos).not.toContain('content-type');
    });

    it('sucesso: devolve o caminho público da imagem', async () => {
      fetchMock.mockResolvedValue(respostaFalsa({ status: 201, corpo: { id: 7, path: '/imgs/profile/abc.png' } }));

      const resultado = await API.sendFile('POST', '/users/image', criarFormData());

      expect(resultado).toEqual({ ok: true, status: 201, data: { id: 7, path: '/imgs/profile/abc.png' } });
    });

    it('erro 400: repassa a mensagem do servidor e mantém a sessão', async () => {
      fetchMock.mockResolvedValue(
        respostaFalsa({ status: 400, corpo: { error: 'Arquivo excede o limite máximo de 2MB.' } }),
      );

      const resultado = await API.sendFile('POST', '/users/image', criarFormData());

      expect(resultado).toEqual({
        ok: false,
        status: 400,
        data: { error: 'Arquivo excede o limite máximo de 2MB.' },
      });
      expect(storage.removeItem).not.toHaveBeenCalled();
    });

    it('erro 401: apaga a sessão e redireciona para o login', async () => {
      fetchMock.mockResolvedValue(respostaFalsa({ status: 401, corpo: { error: 'Token não fornecido.' } }));

      await API.sendFile('PUT', '/users/image', criarFormData());

      expect(storage.removeItem).toHaveBeenCalledWith('token');
      expect(storage.removeItem).toHaveBeenCalledWith('role');
      expect(localizacao.href).toBe('login.html');
    });

    it('falha de rede: a promessa é rejeitada', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(API.sendFile('POST', '/users/image', criarFormData())).rejects.toThrow('Failed to fetch');
    });
  });
});
