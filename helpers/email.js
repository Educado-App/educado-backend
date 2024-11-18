const keys = require('../config/keys');
const nodemailer = require('nodemailer');
const { patterns } = require('./patterns');
/*
This is somewhat complicated because we have to create a template for the email that will be sent to the user.
The template is an HTML file that contains the email content and some CSS styles to make it look good.
The template is then passed to the sendMail function, which sends the email to the user.
The sendMail function uses the nodemailer library to send the email.
The sendMail function takes an object with the following properties:
	subject: The subject of the email.
	from: The email address of the sender.
	to: The email address of the recipient.
	text: The plain text version of the email.
	html: The HTML version of the email.
The sendMail function then creates a transporter object using the nodemailer.createTransport function.
The transporter object is used to send the email using the sendMail method.


If in the future you want to create a new mail, 
you can ask Copilot or GPT to create a new mail with
the same style names, to match the existing style. 
Where you give the GPT the Title, Text and etc.
*/
module.exports = Object.freeze({
	sendResetPasswordEmail,
	sendVerificationEmail,
	sendMail
});

// Utility function to generate the common email template
function generateEmailTemplate(content) {
	return `
	<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Educado Email</title>
    <style type="text/css">
      table {
        border-spacing: 0;
        border-collapse: collapse;
        width: 100%;
        height: 100%;
      }
      .email-wrapper {
        width: 100%;
        max-width: 480px;
        margin: 0 auto;
      }
      .email-body_inner {
        width: 100%;
        background-color: #ffffff;
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        margin: 0 auto;
      }
      .content-cell {
        padding: 30px;
        font-family: 'Nunito Sans', Arial, sans-serif;
        color: #51545e;
        line-height: 1.5;
      }
      .button {
        background-color: #3869d4;
        color: #fff;
        text-decoration: none;
        padding: 10px 18px;
        border-radius: 3px;
        display: inline-block;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .code {
        font-size: 24px;
        font-weight: bold;
        margin: 20px 0;
        display: block;
      }
      .footer {
        padding: 20px;
        background-color: #f2f4f6;
        border-top: 1px solid #eaeaec;
      }
      .footer img {
        width: 100px;
        vertical-align: middle;
      }
    </style>
  </head>
  <body>
    <table cellpadding="30" cellspacing="30" style="background: url('https://i.imgur.com/6llHxtB.jpg') center center / cover no-repeat; width: 100%; height: 100%;">
      <tr>
        <td height="20%"></td>
      </tr>
      <tr>
        <td align="" valign="top">
          <table class="email-wrapper" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <table class="email-body_inner" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td class="content-cell">
                      ${content}
                    </td>
                  </tr>
                  <tr>
                    <td class="footer">
                      <img style="width: 20px; height: 20px;" src="https://i.imgur.com/awfkK2F.png" alt="Educado Logo" />
                      <img src="https://i.imgur.com/dEaqpbg.png" alt="Educado Text" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td height="70%"></td>
      </tr>
    </table>
  </body>
</html>
	`;
}

async function sendMail({
	subject,
	from = keys.GMAIL_USER,
	to,
	text,
	html,
}) {
	if (!patterns.email.test(from) || !patterns.email.test(to)) {
		throw new Error('Invalid email');
	}

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			type: 'login',
			user: keys.GMAIL_USER,
			pass: keys.GMAIL_APP_PASSWORD,
		},
		tls: {
			rejectUnauthorized: false,
		},
	});

	const mailOptions = { subject, from, to, text, html };

	await transporter.sendMail(mailOptions);
	return mailOptions;
}

async function sendResetPasswordEmail(user, token) {
	const subject = 'Redefinição de Senha - Educado';
	const to = user.email;
	const text = `Olá ${user.firstName},\n\nRecebemos uma solicitação para redefinir a senha de sua conta no Educado.\n\nUse o código abaixo para redefinir sua senha:\n\nCódigo de redefinição: ${token}\n\nEste código é válido por 5 minutos. Caso não tenha solicitado a redefinição, por favor, ignore este e-mail ou entre em contato com nosso suporte para garantir a segurança de sua conta.\n\nEstamos aqui para ajudar!\n\nAtenciosamente,\nEquipe Educado.\n\n---\nEsta é uma mensagem automática. Por favor, não responda diretamente a este e-mail.`;

	const content = `
	<h1 style="margin: 0; font-size: 22px; font-weight: bold;">Olá, ${user.firstName}</h1>
	<p style="margin: 16px 0; font-size: 16px; ">Recebemos uma solicitação para redefinir a senha de sua conta no Educado.</p>
	<p style="margin: 16px 0; font-size: 16px; ">Use o código abaixo para redefinir sua senha:</p>
	<p class="code" style="font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">${token}</p>
	<p style="margin: 16px 0; font-size: 16px; ">Este código é válido por <strong>5 minutos</strong>. Por favor, insira-o antes que expire.</p>
	<p style="margin: 16px 0; font-size: 16px;">Se você não solicitou esta redefinição, ignore este e-mail ou entre em contato com nosso suporte para garantir a segurança de sua conta.</p>
	<p style="margin: 16px 0; font-size: 16px; ">Obrigado por usar o Educado!</p>
	<p style="margin: 16px 0; font-size: 16px; ">Atenciosamente,</p>
	<p style="margin: 16px 0; font-size: 16px; font-weight: bold;">Educado</p>
	<p style="margin-top: 32px; font-size: 12px; text-align: center; color: #999;">Esta é uma mensagem automática. Por favor, não responda diretamente a este e-mail.</p>
	`;

	const html = generateEmailTemplate(content);
	return await sendMail({ subject, to, text, html });
}

async function sendVerificationEmail(user, token) {
	const subject = 'Confirmação de E-mail - Educado';
	const to = user.email;
	const text = `Olá ${user.firstName},\n\nObrigado por iniciar o processo de criação de sua conta no Educado!\n\nPara confirmar seu endereço de e-mail, use o código abaixo:\n\nCódigo de verificação: ${token}\n\nEste código é válido por apenas 5 minutos, então não espere muito para usá-lo.\n\nCaso você não tenha solicitado esta ação, por favor ignore este e-mail ou entre em contato com nossa equipe de suporte imediatamente para garantir a segurança da sua conta.\n\nEstamos aqui para ajudar!\n\nAtenciosamente,\nEquipe Educado.\n\n---\nEsta é uma mensagem automática, por favor, não responda diretamente a este e-mail.`;

	const content = `
	<h1 style="margin: 0; font-size: 22px; font-weight: bold;">Bem-vindo ao Educado, ${user.firstName}!</h1>
	<p style="margin: 16px 0; font-size: 16px;">Estamos animados por você estar se juntando à nossa comunidade!</p>
	<p style="margin: 16px 0; font-size: 16px; ">Para concluir seu registro, use o código abaixo para verificar seu e-mail:</p>
	<p class="code" style="font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">${token}</p>
	<p style="margin: 16px 0; font-size: 16px; ">Este código é válido por <strong>5 minutos</strong>. Por favor, insira-o antes que expire.</p>
	<p style="margin: 16px 0; font-size: 16px; ">Se você não fez esta solicitação, ignore este e-mail ou entre em contato com nossa equipe de suporte para garantir a segurança de sua conta.</p>
	<p style="margin: 16px 0; font-size: 16px; ">Obrigado por escolher o Educado!</p>
	<p style="margin: 16px 0; font-size: 16px; ">Atenciosamente,</p>
	<p style="margin: 16px 0; font-size: 16px;  font-weight: bold;">Educado</p>
	<p style="margin-top: 32px; font-size: 12px; text-align: center; color: #999;">Esta é uma mensagem automática. Por favor, não responda diretamente a este e-mail.</p>
	`;

	const html = generateEmailTemplate(content);
	return await sendMail({ subject, to, text, html });
}