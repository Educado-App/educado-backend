const emailHelper = require('../../helpers/email');

jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn(() => {
      return {
        sendMail: jest.fn(),
      };
    }),
  };
});

jest.mock('../../config/keys', () => {
  return {
    GMAIL_USER: 'educadotest4@gmail.com',
    GMAIL_APP_PASSWORD: 'test',
  };
});

describe('sendResetPasswordEmail', () => {
  it('should send reset password email with correct content', async () => {
    const user = {
      firstName: 'John',
      email: 'test@email.com',
    };
    const token = '1234';

    const expectedMailOptions = {
      subject: 'Redefinição de Senha - Educado',
      from: 'educadotest4@gmail.com',
      to: user.email,
      text: `Olá ${user.firstName},\n\nRecebemos uma solicitação para redefinir a senha de sua conta no Educado.\n\nUse o código abaixo para redefinir sua senha:\n\nCódigo de redefinição: ${token}\n\nEste código é válido por 5 minutos. Caso não tenha solicitado a redefinição, por favor, ignore este e-mail ou entre em contato com nosso suporte para garantir a segurança de sua conta.\n\nEstamos aqui para ajudar!\n\nAtenciosamente,\nEquipe Educado.\n\n---\nEsta é uma mensagem automática. Por favor, não responda diretamente a este e-mail.`,
      html: expect.stringContaining('<p class="code"'), // Simplified check for HTML
    };

    const result = await emailHelper.sendResetPasswordEmail(user, token);
    expect(result).toMatchObject(expectedMailOptions);
  });
});

describe('sendVerificationEmail', () => {
  it('should send verification email with correct content', async () => {
    const user = {
      firstName: 'John',
      email: 'test@email.com',
    };
    const token = '1234';

    const expectedMailOptions = {
      subject: 'Confirmação de E-mail - Educado',
      from: 'educadotest4@gmail.com',
      to: user.email,
      text: `Olá ${user.firstName},\n\nObrigado por iniciar o processo de criação de sua conta no Educado!\n\nPara confirmar seu endereço de e-mail, use o código abaixo:\n\nCódigo de verificação: ${token}\n\nEste código é válido por apenas 5 minutos, então não espere muito para usá-lo.\n\nCaso você não tenha solicitado esta ação, por favor ignore este e-mail ou entre em contato com nossa equipe de suporte imediatamente para garantir a segurança da sua conta.\n\nEstamos aqui para ajudar!\n\nAtenciosamente,\nEquipe Educado.\n\n---\nEsta é uma mensagem automática, por favor, não responda diretamente a este e-mail.`,
      html: expect.stringContaining('<p class="code"'), // Simplified check for HTML
    };

    const result = await emailHelper.sendVerificationEmail(user, token);
    expect(result).toMatchObject(expectedMailOptions);
  });
});

describe('sendMail', () => {
  it('should send email with given options', async () => {
    const mailOptions = {
      subject: 'Test email',
      from: 'educadotest4@gmail.com',
      to: 'test@user.com',
      text: 'This is a test email',
      html: '<p>This is a test email</p>',
    };

    const result = await emailHelper.sendMail(mailOptions);
    expect(result).toMatchObject(mailOptions);
  });

  it('should throw error for invalid email addresses', async () => {
    const mailOptions = {
      subject: 'Invalid email test',
      from: 'invalid-email',
      to: "",
      text: 'This is a test email',
      html: '<p>This is a test email</p>',
    };

    await expect(emailHelper.sendMail(mailOptions)).rejects.toThrow(
      'Invalid email'
    );
  });
});
