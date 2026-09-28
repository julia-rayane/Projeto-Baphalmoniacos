import nodemailer from 'nodemailer';

export default async function mailConfig() {
  const host = process.env.EMAIL_HOST || process.env.MAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || process.env.MAIL_PORT) || 587;
  const user = process.env.EMAIL_USER || process.env.MAIL_USER;
  const pass = process.env.EMAIL_PASS || process.env.MAIL_PASS;
  const secure = process.env.EMAIL_SECURE === 'true' || process.env.MAIL_SECURE === 'true';

  // Se houver credenciais passadas via .env, usa o servidor SMTP configurado
  if (host && user && pass) {
    return {
      host,
      port,
      secure,
      auth: { user, pass }
    };
  }

  // Caso contrário, gera uma conta de testes automática do Ethereal Mail
  const testAccount = await nodemailer.createTestAccount();
  return {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  };
}
