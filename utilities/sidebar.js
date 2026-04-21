const moment = require('moment')

const storyController = require('../controller/story.controller')
const Category = require('../models/Category')
const BunnyCDN = require('../modules/bunnyCDN')

module.exports = async (req, res, next) => {
  const StoryController = new storyController()
  const [topTrending, topWeekly, topMonthly, categories] = await Promise.all([
    StoryController.getManyWithChapter('views', 0, 5, 1),
    StoryController.getManyWithChapter('viewsWeekly', 0, 5, 1),
    StoryController.getManyWithChapter('viewsMonthly', 0, 5, 1),
    Category.find()
  ])
  res.locals.topTrending = topTrending
  res.locals.topWeekly = topWeekly
  res.locals.topMonthly = topMonthly
  res.locals.categories = categories
  res.locals.webAssets = BunnyCDN.webAssets
  res.locals.moment = moment
  res.locals.lightTheme = !!req.cookies.lightTheme
  next()
}
