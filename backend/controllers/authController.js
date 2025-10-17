import crypto from 'crypto'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import { sendMail } from '../utils/Email.js'

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'No user found with this email' })

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expireTime = Date.now() + 15 * 60 * 1000 // 15 minutes

    user.resetPasswordToken = token
    user.resetPasswordExpires = expireTime
    await user.save()

    // Reset link (frontend route)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`

    // Send email
    const html = `
      <h2>Password Reset</h2>
      <p>Hi ${user.name || ''},</p>
      <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
      <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#6d28d9;color:white;text-decoration:none;border-radius:6px;">Reset Password</a>
      <p>If you didn’t request this, you can safely ignore this email.</p>
    `

    await sendMail(user.email, 'Password Reset - Service Connect', '', html)

    res.json({ message: 'Password reset link sent to your email' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong' })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // still valid
    })

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' })

    // Hash new password
    const hashed = await bcrypt.hash(password, 10)
    user.password = hashed
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}