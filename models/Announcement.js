const mongoose = require('mongoose')

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'danger'],
    default: 'info'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Number,
    default: Date.now
  }
})

module.exports = mongoose.model('Announcement', AnnouncementSchema)
