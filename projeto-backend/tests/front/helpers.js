// Dublês usados nos testes do front-end (fetch e localStorage NUNCA são os reais)
import { vi } from 'vitest';

// localStorage falso, em memória, com espiões em cada método
export function criarStorageFalso(inicial = {}) {
  const dados = new Map(Object.entries(inicial));
  return {
    getItem: vi.fn((chave) => (dados.has(chave) ? dados.get(chave) : null)),
    setItem: vi.fn((chave, valor) => {
      dados.set(chave, String(valor));
    }),
    removeItem: vi.fn((chave) => {
      dados.delete(chave);
    }),
    clear: vi.fn(() => dados.clear()),
  };
}

// Resposta falsa no formato mínimo que o código usa de um Response do fetch
export function respostaFalsa({ status = 200, corpo = {}, jsonInvalido = false } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jsonInvalido
      ? vi.fn().mockRejectedValue(new SyntaxError('Unexpected token < in JSON'))
      : vi.fn().mockResolvedValue(corpo),
  };
}
