const nodemailer = require('nodemailer')
const { env } = require('../config/environment')

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
})

const sendResetEmail = async (to, code) => {
  await transporter.sendMail({
    from: env.EMAIL_USER,
    to,
    subject: 'Reset your password',
    html: `<p>Your reset code is: <strong>${code}</strong></p>`
  })
}

module.exports = { sendResetEmail }
