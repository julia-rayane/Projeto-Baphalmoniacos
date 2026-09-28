import nodemailer from 'nodemailer';
import mailConfig from '../config/mail';

class SendMail {
  async createNewUser(to: string) {
    const config = await mailConfig();
    const transporter = nodemailer.createTransport(config);

    const info = await transporter.sendMail({
      from: '"Equipe de Suporte" <noreplay@email.com>',
      to: to,
      subject: 'Conta criada no Foods App',
      text: 'Conta criada com sucesso. Acesse o aplicativo para gerenciar o cadastro de comidas.',
      html: '<h1>Conta criada com sucesso.</h1><p>Acesse o aplicativo para gerenciar o cadastro de comidas.</p>',
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Send email:', nodemailer.getTestMessageUrl(info));
    }
  }
}

export default new SendMail();
