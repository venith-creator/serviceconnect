import express from 'express'
import { submitContact,replyToContact } from '../controllers/contactController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import Contact from '../models/Contact.js'

const router = express.Router()

// 📨 Public route - anyone can contact
router.post('/', submitContact)

// 👑 Admin-only route to get all contacts
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 })
    res.json(contacts)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contacts' })
  }
})
router.post('/reply/:id', protect, authorizeRoles('admin'), replyToContact)

export default router
