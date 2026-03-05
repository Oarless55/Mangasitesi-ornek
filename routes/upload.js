const express = require('express')
const router = express.Router()
const upload = require('../config/multer')
const uploadController = require('../controller/upload.controller')

router.post('/upload/single', upload.single('image'), async ({ file, body }, res, next) => {
  const UploadController = new uploadController()
  const path = await UploadController.uploadSingle(body.type, file, body.pathName || file.path)
  if (path) {
    return res.status(200).json({
      msg: 'Başarılı',
      success: true,
      data: path
    })
  } else {
    return res.status(400).json({
      msg: 'Yükleme başarısız (CDN/Sunucu Hatası)',
      success: false
    })
  }
})

router.post('/upload/bot', upload.array('images', 500), async ({ files, body }, res, next) => {
  try {
    const BotController = require('../controller/bot.controller')
    const controller = new BotController()

    // Pass the story ID, chapter name, and the array of image files
    const result = await controller.processFolderUpload(body.story, body.chapterName, files)

    if (result.success) {
      return res.status(200).json(result)
    } else {
      return res.status(400).json(result)
    }
  } catch (error) {
    console.error('Bot Upload Route Error:', error)
    return res.status(500).json({ msg: 'Sunucu hatası: ' + error.message, success: false })
  }
})

module.exports = router
