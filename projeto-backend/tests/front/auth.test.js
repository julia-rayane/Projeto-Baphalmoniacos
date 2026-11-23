import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Auth from '../../public/js/lib/auth.js';
import { criarStorageFalso } from './helpers.js';

describe('lib/auth.js', () => {
  let storage;
  let localizacao;

  beforeEach(() => {
    storage = criarStorageFalso({ token: 'abc.def.ghi', role: 'cliente', carrinho: '[1,2]' });
    localizacao = { href: 'http://localhost/perfil.html' };
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('location', localizacao);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getToken', () => {
    it('lê o token da chave "token" do localStorage', () => {
      expect(Auth.getToken()).toBe('abc.def.ghi');
      expect(storage.getItem).toHaveBeenCalledWith('token');
    });

    it('devolve null quando não há token salvo (valor ausente)', () => {
      storage = criarStorageFalso();
      vi.stubGlobal('localStorage', storage);

      expect(Auth.getToken()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('é verdadeiro quando existe token', () => {
      expect(Auth.isAuthenticated()).toBe(true);
    });

    it('é falso sem token', () => {
      vi.stubGlobal('localStorage', criarStorageFalso());

      expect(Auth.isAuthenticated()).toBe(false);
    });

    it('é falso quando o token é uma string vazia (caso de borda)', () => {
      vi.stubGlobal('localStorage', criarStorageFalso({ token: '' }));

      expect(Auth.isAuthenticated()).toBe(false);
    });
  });

  describe('signout', () => {
    it('remove token e role e redireciona para o login', () => {
      Auth.signout();

      expect(storage.removeItem).toHaveBeenCalledWith('token');
      expect(storage.removeItem).toHaveBeenCalledWith('role');
      expect(localizacao.href).toBe('login.html');
    });

    it('não apaga outros dados do navegador (ex.: carrinho)', () => {
      Auth.signout();

      expect(storage.removeItem).not.toHaveBeenCalledWith('carrinho');
      expect(storage.getItem('carrinho')).toBe('[1,2]');
    });
  });
});
