const express = require('express')
const router = express.Router()

const categoryController = require('../controller/category.controller')

// Legacy redirect
router.get('/the-loai/:slug.:id', (req, res) => {
  res.redirect(301, `/turler/${req.params.slug}.${req.params.id}`)
})

router.get('/turler/:slug.:id', async ({ params, query }, res, next) => {
  const CategoryController = new categoryController()
  const category = await CategoryController.getOne(parseInt(params.id))
  if (!category) {
    return res.redirect('/404')
  }
  const [count, stories] = await Promise.all([
    CategoryController.getCountStory(category._id),
    CategoryController.categoryGetBooks(
      category._id,
      query.order || 'updatedAt',
      0,
      8
    )
  ])
  res.render('category', {
    category,
    count,
    order: query.order,
    stories
  })
})

module.exports = router
