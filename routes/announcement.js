const express = require('express')
const router = express.Router()
const Announcement = require('../models/Announcement')

// Admin guard middleware
function isAdmin(req, res, next) {
  if (!res.locals.user || res.locals.user.role !== 'admin') {
    return res.status(403).json({ error: 'Yetkisiz erişim' })
  }
  next()
}

// GET /api/announcements — Aktif duyuruları listele (herkese açık)
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
    res.json({ success: true, announcements })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/announcements — Yeni duyuru ekle (sadece admin)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, content, type } = req.body
    if (!title || !content) return res.status(400).json({ error: 'Başlık ve içerik zorunludur' })
    const ann = await Announcement.create({ title, content, type: type || 'info' })
    res.json({ success: true, announcement: ann })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/announcements/:id — Duyuru sil (sadece admin)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PATCH /api/announcements/:id/toggle — Aktif/pasif yap (sadece admin)
router.patch('/:id/toggle', isAdmin, async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id)
    if (!ann) return res.status(404).json({ error: 'Bulunamadı' })
    ann.isActive = !ann.isActive
    await ann.save()
    res.json({ success: true, isActive: ann.isActive })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router

