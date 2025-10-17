import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  whatsapp: { type: String, required: true }, 
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  reply: { type: String }, //  admin reply message
  repliedAt: { type: Date }, //  time of reply
})

export default mongoose.model('Contact', contactSchema)