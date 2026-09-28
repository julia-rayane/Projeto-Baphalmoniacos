import nodemailer from 'nodemailer';

async function mailConfig() {
  // 1. Se existirem variáveis no .env, usa a configuração do ambiente
  if (process.env.MAIL_USER && process.env.MAIL_PASS) {
    return {
      host: process.env.MAIL_HOST || 'smtp.ethereal.email',
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    };
  }

  // 2. Se não houver .env preenchido, gera a conta de teste do Ethereal
  const testAccount = await nodemailer.createTestAccount();

  return {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  };
}

export default mailConfig;
