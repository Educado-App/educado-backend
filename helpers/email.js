const keys = require('../config/keys');
const nodemailer = require('nodemailer');

module.exports = Object.freeze({
  isValid,
  send: sendMail
});

function isValid(email) {
  const regEx = new RegExp('^[0-9a-zA-Z.]+@[a-zA-Z]+.[a-zA-Z]{2,4}');
  return regEx.test(email);
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
      user: keys.gmailUser,
      pass: keys.gmailAppPass,

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




