import nodemailer from 'nodemailer';
import mailConfig from '../config/mail';

class SendMail {
  async createNewUser(to: string) {
    try {
      const config = await mailConfig();
      const transporter = nodemailer.createTransport(config);

      const info = await transporter.sendMail({
        from: '"Equipe de Suporte" <noreplay@email.com>',
        to: to,
        subject: 'Conta criada no Foods App',
        text: 'Conta criada com sucesso. Acesse o aplicativo para gerenciar o seu perfil.',
        html: '<h1>Conta criada com sucesso.</h1><p>Acesse o aplicativo para gerenciar o seu perfil.</p>'
      });

      console.log('Send email:', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('Erro ao enviar e-mail pelo Nodemailer:', error);
    }
  }
}

export default new SendMail();
