// Segredo do JWT vem SEMPRE do .env (nunca fica fixo no código).
const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET não definido. Copie .env.example para .env e preencha o valor.');
}

export const JWT_SECRET: string = secret;
