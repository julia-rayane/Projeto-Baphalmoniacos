import nodemailer from 'nodemailer';

export default async function mailConfig() {
  if (process.env.NODE_ENV === 'development') {
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

  return {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
}
