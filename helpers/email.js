module.exports = Object.freeze({
    isValid
})

function isValid(email) {
    const regEx = new RegExp("^[0-9a-zA-Z.]+@[a-zA-Z]+.[a-zA-Z]{2,4}")
    return regEx.test(email)
}


//functions for the mailroutes file
const nodemailer = require("nodemailer");
const dev = require("../config/dev");


/**
 * Allows to send mail to an email address. include email, subject and text.
 */
function sendMail(email,subject,text) {
  let transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      type: "login",
      user: dev.outlookUser,
      pass: dev.outlookPass,

    },
    tls: {
      rejectUnauthorized: false,
    }
  })

  let mailOptions = {
    from: dev.outlookUser,
    to: email,
    subject: subject,
    text: text,
  }

transporter.sendMail(mailOptions, function (err, success) {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent successfully");
    }
  })
}

module.exports = {sendMail};




