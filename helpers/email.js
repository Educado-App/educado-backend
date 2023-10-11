const keys = require('../config/keys');
const nodemailer = require('nodemailer');
const regexPatterns = require('./patterns');

module.exports = Object.freeze({
	isValid,
	sendResetPasswordEmail,
});

function isValid(email) {
	return regexPatterns.email.test(email);
}


async function sendMail({
	subject,
	from = keys.gmailUser,
	to, 
	text,
	html
}) {

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			type: 'login',
			user: keys.GMAIL_USER,
			pass: keys.GMAIL_APP_PASSWORD,

		},
		tls: {
			rejectUnauthorized: false,
		}
	});

	const mailOptions = {
		subject: subject,
		from: from,
		to: to,
		text: text,
		html: html
	};

	await transporter.sendMail(mailOptions);
}

function sendResetPasswordEmail(user, token) {
  const subject = 'Reset password request for Educado';
  const to = user.email;
  const text = `Hi ${user.firstName},
  You have requested to reset your password. Please enter the following code in the app to reset your password:

  ${token}

  If you did not request this, please ignore this email and your password will remain unchanged. 

  Best regards,
  The Educado team
  `;
  const html = `
  <p>Hi ${user.firstName},</p>
  <p>You have requested to reset your password. Please enter the following code in the app to reset your password:</p>
  <p><strong>${token}</strong></p>
  <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;
  sendMail({ subject, to, text, html });
  return true;
}
