const router = require('express').Router();
const User = require('../models/User');
const Comment = require('../models/Comment');
const socketApi = require('../socket');

// Middleware to check if user is authenticated (simple check based on cookie or session if available)
// Project seems to use cookies for simple auth. We'll extract user from req.cookies or similar if standard.
// Actually, I'll put auth logic directly in the route for simplicity, matching the project style if needed.

router.get('/:storyId', async (req, res) => {
    try {
        const { storyId } = req.params;
        const { sort = 'newest' } = req.query; // newest, oldest, best

        let sortOptions = { _id: -1 }; // default newest
        if (sort === 'oldest') sortOptions = { _id: 1 };

        let comments = await Comment.aggregate([
            { $match: { story: parseInt(storyId) } },
            { $sort: sortOptions },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } }
        ]);

        // Sort by best if requested (requires sorting by array length)
        if (sort === 'best') {
            comments.sort((a, b) => (b.likes ? b.likes.length : 0) - (a.likes ? a.likes.length : 0));
        }

        res.json({ success: true, comments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { storyId, content, parentId } = req.body;
        let userId = null;

        // Check global user if logged in (from cookies/session based on app.js and auth middlewares)
        if (req.user && req.user._id) {
            userId = req.user._id;
        } else if (req.cookies && req.cookies._token) {
            // Fallback for simple token extraction if standard middleware isn't here
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(req.cookies._token, process.env.SECRET);
                userId = decoded._id;
            } catch (e) { }
        }

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Lütfen giriş yapın' });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, error: 'Yorum boş olamaz' });
        }

        const comment = await Comment.create({
            story: parseInt(storyId),
            user: userId,
            content: content.trim(),
            parent: parentId ? parseInt(parentId) : null,
            createdAt: Date.now()
        });
        
        // --- BADGE ENGINE: Yorum Canavarı ---
        try {
            const commentCount = await Comment.countDocuments({ user: userId });
            if (commentCount === 1) {
                const userObj = await User.findById(userId);
                if (userObj) {
                    if (!userObj.badges) userObj.badges = [];
                    if (!userObj.badges.find(b => b.id === 'yorum_canavari')) {
                        const badge = {
                            id: 'yorum_canavari', name: 'Yorum Canavarı', icon: 'fas fa-comment-dots', description: 'İlk yorumunuzu yaparak sohbete katıldınız!'
                        };
                        userObj.badges.push(badge);
                        await userObj.save();
                        
                        if (socketApi && socketApi.io) {
                            socketApi.io.emit('badge-unlocked', {
                                user: userObj.name,
                                userAvatar: userObj.avatar,
                                badgeName: badge.name,
                                badgeIcon: badge.icon,
                                badgeDesc: badge.description
                            });
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Badge error in comment:', e);
        }
        // --- END BADGE ENGINE ---

        res.json({ success: true, comment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/like', async (req, res) => {
    try {
        const { commentId } = req.body;
        let userId = null;

        if (req.user && req.user._id) {
            userId = req.user._id;
        } else if (req.cookies && req.cookies._token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(req.cookies._token, process.env.SECRET);
                userId = decoded._id;
            } catch (e) { }
        }

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Lütfen giriş yapın' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, error: 'Yorum bulunamadı' });

        const likeIndex = comment.likes.indexOf(userId);
        if (likeIndex > -1) {
            // Unlike
            comment.likes.splice(likeIndex, 1);
        } else {
            // Like
            comment.likes.push(userId);
        }

        await comment.save();

        res.json({ success: true, likesCount: comment.likes.length, isLiked: likeIndex === -1 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
