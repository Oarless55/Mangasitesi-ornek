const express = require('express')
const router = express.Router()

router.get('/cookie-policy', async (req, res, next) => {
  res.render('cookie_policy', { title: 'Gizlilik Politikası' })
})

module.exports = router
