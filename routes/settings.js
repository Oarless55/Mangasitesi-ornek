const express = require('express')
const router = express.Router()

const User = require('../models/User')
const Category = require('../models/Category')
const Story = require('../models/Story')
const socketApi = require('../socket')

// Bookmark Toggle Route
router.post('/api/bookmark', async (req, res) => {
  if (!res.locals.user) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const { storyId } = req.body
    const user = await User.findById(res.locals.user._id)
    const index = user.bookmarks.indexOf(storyId)
    let newBadges = [];
    if (index === -1) {
      user.bookmarks.unshift(storyId) // Add to top
      
      // --- BADGE ENGINE: Sosyal Kelebek ---
      if (!user.badges) user.badges = [];
      if (user.bookmarks.length === 1 && !user.badges.find(b => b.id === 'sosyal_kelebek')) {
        const badge = {
          id: 'sosyal_kelebek', name: 'Sosyal Kelebek', icon: 'fas fa-heart', description: 'İlk defa bir seriyi favorilerinize eklediniz!'
        };
        user.badges.push(badge);
        newBadges.push(badge);
        
        if (socketApi && socketApi.io) {
          socketApi.io.emit('badge-unlocked', {
            user: user.name,
            userAvatar: user.avatar,
            badgeName: badge.name,
            badgeIcon: badge.icon,
            badgeDesc: badge.description
          });
        }
      }
    } else {
      user.bookmarks.splice(index, 1) // Remove
    }
    await user.save()
    res.json({ success: true, isBookmarked: index === -1, newBadges })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// History Update Route
router.post('/api/history', async (req, res) => {
  if (!res.locals.user) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const { storyId, chapterUrl, chapterName } = req.body
    const user = await User.findById(res.locals.user._id)
    
    // Check if it exists and remove it to bump it down to top
    const existingIndex = user.history.findIndex(h => h.story && h.story.toString() === storyId)
    if (existingIndex !== -1) {
      user.history.splice(existingIndex, 1)
    }
    
    user.history.unshift({
      story: storyId,
      chapterUrl,
      chapterName,
      timestamp: new Date()
    })

    // Keep history bounded to 100 items max
    if (user.history.length > 100) {
      user.history = user.history.slice(0, 100);
    }
    
    user.totalReadChapters = (user.totalReadChapters || 0) + 1;
    
    // --- BADGE ENGINE ---
    if (!user.badges) user.badges = [];
    let newBadges = [];
    
    // 1. İlk Kan (First Blood)
    if (user.totalReadChapters === 1 && !user.badges.find(b => b.id === 'ilk_kan')) {
      newBadges.push({
        id: 'ilk_kan', name: 'İlk Kan', icon: 'fas fa-tint', description: 'İlk bölümünü okudun!'
      });
    }

    // 2. Gece Kuşu (Night Owl) - check between 03:00 and 05:00
    const currentHour = new Date().getHours();
    if (currentHour >= 3 && currentHour < 5 && !user.badges.find(b => b.id === 'gece_kusu')) {
      newBadges.push({
        id: 'gece_kusu', name: 'Gece Kuşu', icon: 'fas fa-moon', description: 'Gecenin köründe, 03:00 - 05:00 arası okuma yaptın.'
      });
    }

    // 3. Isekai Maceracısı
    const story = await Story.findById(storyId).populate('categories');
    if (story && story.categories) {
       const isIsekai = story.categories.some(cat => cat.name && cat.name.toLowerCase().includes('isekai'));
       if (isIsekai && !user.badges.find(b => b.id === 'isekai_maceracisi')) {
         newBadges.push({
           id: 'isekai_maceracisi', name: 'Isekai Maceracısı', icon: 'fas fa-truck', description: 'Kamyon-kun seni de buldu! Isekai türünde okuma yaptın.'
         });
       }
    }

    // 4. Usta Okuyucu
    if (user.totalReadChapters === 50 && !user.badges.find(b => b.id === 'usta_okuyucu')) {
      newBadges.push({
        id: 'usta_okuyucu', name: 'Usta Okuyucu', icon: 'fas fa-book-reader', description: 'Tam 50 bölüm okudun! Manga dünyasının tozunu yutmaya başladın.'
      });
    }

    if (newBadges.length > 0) {
      user.badges.push(...newBadges);
      
      // Emit socket events for each earned badge
      if (socketApi && socketApi.io) {
        newBadges.forEach(badge => {
          socketApi.io.emit('badge-unlocked', {
            user: user.name,
            userAvatar: user.avatar,
            badgeName: badge.name,
            badgeIcon: badge.icon,
            badgeDesc: badge.description
          });
        });
      }
    }
    // --- END BADGE ENGINE ---

    await user.save()

    // --- LIVE STREAM EVENT ---
    if (socketApi && socketApi.io) {
      socketApi.io.emit('recent-activity', {
        user: user.name,
        userAvatar: user.avatar,
        chapterName: chapterName || 'Bir bölüm',
        storyName: story ? story.name : 'Bir seri',
        url: chapterUrl || '#'
      });
    }
    // --- END LIVE STREAM EVENT ---

    res.json({ success: true, newBadges })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/:type(history|bookmark|account)', async (req, res, next) => {
  if (!res.locals.user) {
    return res.status(401).redirect('/404')
  }
  
  let cloudLibrary = { bookmarks: [], history: [] }
  try {
    const user = await User.findById(res.locals.user._id)
      .populate('bookmarks')
      .populate('history.story')
      .lean()
      
    if (user) {
      cloudLibrary.bookmarks = user.bookmarks.filter(s => s != null)
      cloudLibrary.history = user.history.filter(h => h.story != null)
      cloudLibrary.badges = user.badges || []

      let totalReads = user.totalReadChapters || 0;
      let levelTitle = '';
      let currentLevel = 0;
      let nextThreshold = 0;
      let percentage = 0;
      
      if (totalReads <= 50) {
        currentLevel = 1; levelTitle = 'Acemi Okuyucu'; nextThreshold = 50;
      } else if (totalReads <= 150) {
        currentLevel = 2; levelTitle = 'Deneyimli Okuyucu'; nextThreshold = 150;
      } else if (totalReads <= 300) {
        currentLevel = 3; levelTitle = 'Usta Okuyucu'; nextThreshold = 300;
      } else if (totalReads <= 500) {
        currentLevel = 4; levelTitle = 'Efsanevi Okuyucu'; nextThreshold = 500;
      } else {
        currentLevel = 5; levelTitle = 'Manga Tanrısı'; 
        nextThreshold = totalReads; // 100% full bar
        percentage = 100;
      }

      if (currentLevel < 5) {
        let prevThreshold = 0;
        if (currentLevel === 2) prevThreshold = 50;
        else if (currentLevel === 3) prevThreshold = 150;
        else if (currentLevel === 4) prevThreshold = 300;
        
        let range = nextThreshold - prevThreshold;
        let progress = totalReads - prevThreshold;
        percentage = Math.floor((progress / range) * 100);
      }
      
      let favGenre = 'Belirsiz';
      if (cloudLibrary.history.length > 0) {
        let catCounts = {};
        cloudLibrary.history.forEach(h => {
           if (h.story && h.story.categories && Array.isArray(h.story.categories)) {
               h.story.categories.forEach(catId => {
                   catCounts[catId] = (catCounts[catId] || 0) + 1;
               })
           }
        });
        
        let maxCatId = null;
        let maxCount = -1;
        for (let [catId, count] of Object.entries(catCounts)) {
           if (count > maxCount) { maxCount = count; maxCatId = catId; }
        }
        
        if (maxCatId) {
           const favCat = await Category.findById(maxCatId).lean();
           if (favCat) favGenre = favCat.name;
        }
      }

      cloudLibrary.stats = {
        totalReads,
        levelTitle,
        currentLevel,
        nextThreshold,
        percentage,
        favoriteGenre: favGenre
      };
    }
  } catch (e) {
    console.error("Cloud Library error:", e)
  }
  
  res.locals.cloudLibrary = cloudLibrary
  return res.render('settings')
})

module.exports = router
