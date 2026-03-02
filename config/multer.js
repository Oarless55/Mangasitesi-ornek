const multer = require('multer')
// SET STORAGE
const storage = multer.diskStorage({
  destination: 'public/upload/temp',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg')
  }
})

module.exports = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/avif', 'application/octet-stream'].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(null, false)
      return cb(new Error('Desteklenmeyen dosya formatı! Sadece Resim yüklenebilir.'))
    }
  }
})
