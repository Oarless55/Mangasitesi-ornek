const express = require('express')
const router = express.Router()

const storyController = require('../controller/story.controller')

router.get('/', async (req, res, next) => {
  const StoryController = new storyController()
  const [stories, topViews] = await Promise.all([
    StoryController.getManyWithChapter('updatedAt', 0, 8, 2),
    StoryController.getManyWithChapter('views', 0, 6, 2)
  ])
  let slider = []
  try {
    slider = require('../slider.js')
  } catch (e) { }
  res.render('index', { stories, topViews, slider })
})

router.get('/api/stories', async (req, res, next) => {
  const { order = 'updatedAt', page = 1, limit = 8 } = req.query;
  const StoryController = new storyController();
  try {
    const stories = await StoryController.getManyWithChapter(order, parseInt(page), parseInt(limit), 2);
    // Add bunnyCDN to the story avatars exactly like controller does for other routes
    const BunnyCDN = require('../modules/bunnyCDN');
    stories.forEach(item => {
      if (item.story) {
        item.story.avatar = BunnyCDN.webAssets(item.story.avatar);
      }
    });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: 'Server err' });
  }
});

module.exports = router
