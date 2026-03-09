const router = require('express').Router();
const Reaction = require('../models/Reaction');
const jwt = require('jsonwebtoken');

// Helper to get user ID
const getUserId = (req) => {
    let userId = null;
    if (req.user && req.user._id) {
        userId = req.user._id;
    } else if (req.cookies && req.cookies.token) {
        try {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            userId = decoded._id;
        } catch (e) { }
    }
    return userId;
};

router.get('/:storyId', async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = getUserId(req);

        // Group reactions by type and count them
        const reactions = await Reaction.aggregate([
            { $match: { story: parseInt(storyId) } },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        // Check user's current reaction if logged in
        let userReaction = null;
        if (userId) {
            const userReact = await Reaction.findOne({ story: parseInt(storyId), user: userId });
            if (userReact) {
                userReaction = userReact.type;
            }
        }

        res.json({ success: true, reactions, userReaction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { storyId, type } = req.body;
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Lütfen giriş yapın' });
        }

        // Find existing reaction
        const existing = await Reaction.findOne({ story: parseInt(storyId), user: userId });

        if (existing) {
            if (existing.type === parseInt(type)) {
                // Remove reaction if clicking the same one again
                await Reaction.findByIdAndDelete(existing._id);
                res.json({ success: true, action: 'removed' });
            } else {
                // Update reaction
                existing.type = parseInt(type);
                await existing.save();
                res.json({ success: true, action: 'updated', type: existing.type });
            }
        } else {
            // Create new reaction
            await Reaction.create({
                story: parseInt(storyId),
                user: userId,
                type: parseInt(type),
                createdAt: Date.now()
            });
            res.json({ success: true, action: 'added', type: parseInt(type) });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
