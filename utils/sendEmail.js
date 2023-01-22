const nodemailer = require("nodemailer");
// Nodemailer
const sendEmail = async (options) => {
  // 1) Create transporter (va être un objet capable d'envoyer du courrier)
  // transporter service that will send email like "gmail", "Mailgun", "mailtrap","sendGrid"
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, //if secure false port = 587, if true port = 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
  // 2) Define email options (like from, to, subject, email content)
  const mailOpts = {
    from: 'E-shop app <test.web.app.2022.05.02@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  }
  // 3) Send email
  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;