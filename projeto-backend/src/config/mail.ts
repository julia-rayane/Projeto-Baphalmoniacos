import nodemailer from 'nodemailer';

async function mailConfig() {
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
