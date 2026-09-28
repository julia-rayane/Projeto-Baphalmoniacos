import { z } from 'zod';

export const usuarioSchema = z.object({
  body: z.object({
    nome: z.string().min(1, 'O nome é obrigatório'),
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  }),
});
