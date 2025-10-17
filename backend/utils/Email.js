import { Resend } from 'resend'
import dotenv from 'dotenv'
dotenv.config()

// ✅ Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// ✅ Send email function
export const sendMail = async (to, subject, text, html) => {
  try {
    const response = await resend.emails.send({
      from: 'Service Connect <support@serviceconnect.uk>', // must use a verified domain or 'onboarding@resend.dev'
      to,
      subject,
      text,
      html,
    })

    console.log('✅ Email sent successfully:', response)
  } catch (error) {
    console.error('❌ Error sending email:', error)
  }
}

/*import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: process.env.NODE_ENV === 'production' ? 465 : 587, // use 465 in prod, 587 locally
  secure: process.env.NODE_ENV === 'production', // true only in prod
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,            
  maxConnections: 3,    
  maxMessages: 10,       
  logger: true,
  debug: true,
})

// ✅ Verify transporter setup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection error:', error.message);
  } else {
    console.log('✅ SMTP server is ready to send emails.');
  }
});

console.log('✅ Preparing to send email...');

export const sendMail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"service connect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    }
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
*/